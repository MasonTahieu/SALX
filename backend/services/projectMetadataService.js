const { ethers } = require('ethers');
const {
  normalizeIpfsUri,
  pinJSONToIPFS,
} = require('./ipfsService');

const KG_CO2_PER_SAL = 10;
const MAX_DOCUMENTS = 20;

const cleanText = (value, field, { required = false, max = 500 } = {}) => {
  const normalized = typeof value === 'string' ? value.trim() : '';

  if (required && !normalized) {
    throw new Error(`${field} là bắt buộc`);
  }

  if (normalized.length > max) {
    throw new Error(`${field} không được vượt quá ${max} ký tự`);
  }

  return normalized || null;
};

const parsePositiveInteger = (value, field) => {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${field} phải là số nguyên dương`);
  }
  return parsed;
};

const normalizeIpfsReference = (value, field, { required = false } = {}) => {
  const text = cleanText(value, field, { required, max: 500 });
  if (!text) return null;

  const normalized = normalizeIpfsUri(text);
  if (!normalized?.startsWith('ipfs://')) {
    throw new Error(`${field} phải là CID hoặc URI ipfs://...`);
  }

  return normalized;
};

const normalizeHttpUrl = (value, field) => {
  const text = cleanText(value, field, { max: 500 });
  if (!text) return null;

  let parsed;
  try {
    parsed = new URL(text);
  } catch (_) {
    throw new Error(`${field} phải là URL hợp lệ`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${field} chỉ hỗ trợ http:// hoặc https://`);
  }

  return parsed.toString();
};

const normalizeDate = (value, field) => {
  const text = cleanText(value, field, { max: 40 });
  if (!text) return null;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} phải là ngày hợp lệ`);
  }

  return date.toISOString();
};

const normalizeDocuments = (documents) => {
  if (documents == null) return [];
  if (!Array.isArray(documents)) {
    throw new Error('documents phải là một mảng');
  }
  if (documents.length > MAX_DOCUMENTS) {
    throw new Error(`documents không được vượt quá ${MAX_DOCUMENTS} tài liệu`);
  }

  return documents.map((document, index) => {
    if (typeof document === 'string') {
      return {
        name: `Document ${index + 1}`,
        uri: normalizeIpfsReference(document, `documents[${index}]`, { required: true }),
      };
    }

    if (!document || typeof document !== 'object' || Array.isArray(document)) {
      throw new Error(`documents[${index}] không hợp lệ`);
    }

    const uri = normalizeIpfsReference(
      document.uri || document.ipfsURI || document.ipfsHash,
      `documents[${index}].uri`,
      { required: true }
    );

    const hash = cleanText(document.sha256, `documents[${index}].sha256`, { max: 64 });
    if (hash && !/^[a-fA-F0-9]{64}$/.test(hash)) {
      throw new Error(`documents[${index}].sha256 phải gồm 64 ký tự hex`);
    }

    return {
      name: cleanText(document.name || document.title, `documents[${index}].name`, {
        max: 160,
      }) || `Document ${index + 1}`,
      uri,
      ...(cleanText(document.type, `documents[${index}].type`, { max: 80 }) && {
        type: document.type.trim(),
      }),
      ...(hash && { sha256: hash.toLowerCase() }),
    };
  });
};

const buildProjectSubmissionMetadata = (payload = {}) => {
  const projectName = cleanText(payload.projectName, 'projectName', {
    required: true,
    max: 160,
  });
  const description = cleanText(payload.description, 'description', {
    required: true,
    max: 5000,
  });

  if (!ethers.isAddress(payload.ownerWallet || '')) {
    throw new Error('ownerWallet không phải địa chỉ Ethereum hợp lệ');
  }
  const ownerWallet = ethers.getAddress(payload.ownerWallet).toLowerCase();

  const proposedCO2Kg = parsePositiveInteger(payload.proposedCO2Kg, 'proposedCO2Kg');
  if (proposedCO2Kg < KG_CO2_PER_SAL) {
    throw new Error(`proposedCO2Kg phải tối thiểu ${KG_CO2_PER_SAL} kg CO2e`);
  }
  if (proposedCO2Kg % KG_CO2_PER_SAL !== 0) {
    throw new Error(`proposedCO2Kg phải chia hết cho ${KG_CO2_PER_SAL} kg CO2e`);
  }

  const projectType = cleanText(payload.projectType, 'projectType', { max: 120 });
  const location = cleanText(payload.location, 'location', { max: 500 });
  const methodology = cleanText(payload.methodology, 'methodology', { max: 500 });
  const image = normalizeIpfsReference(payload.image || payload.imageURI, 'image');
  const externalUrl = normalizeHttpUrl(payload.externalUrl, 'externalUrl');
  const monitoringStart = normalizeDate(payload.monitoringStart, 'monitoringStart');
  const monitoringEnd = normalizeDate(payload.monitoringEnd, 'monitoringEnd');

  if (
    monitoringStart &&
    monitoringEnd &&
    new Date(monitoringEnd).getTime() < new Date(monitoringStart).getTime()
  ) {
    throw new Error('monitoringEnd không được sớm hơn monitoringStart');
  }

  const documents = normalizeDocuments(payload.documents);
  const submittedAt = new Date().toISOString();
  const requestedSALAmount = proposedCO2Kg / KG_CO2_PER_SAL;

  const attributes = [
    { trait_type: 'Project Owner', value: ownerWallet },
    { trait_type: 'Proposed CO2 (kg)', value: proposedCO2Kg, display_type: 'number' },
    { trait_type: 'Requested SAL Amount', value: requestedSALAmount, display_type: 'number' },
    { trait_type: 'CO2 per SAL (kg)', value: KG_CO2_PER_SAL, display_type: 'number' },
  ];

  if (projectType) attributes.push({ trait_type: 'Project Type', value: projectType });
  if (location) attributes.push({ trait_type: 'Location', value: location });
  if (methodology) attributes.push({ trait_type: 'Methodology', value: methodology });
  if (monitoringStart) attributes.push({ trait_type: 'Monitoring Start', value: monitoringStart });
  if (monitoringEnd) attributes.push({ trait_type: 'Monitoring End', value: monitoringEnd });

  const metadata = {
    name: projectName,
    description,
    ...(image && { image }),
    ...(externalUrl && { external_url: externalUrl }),
    attributes,
    properties: {
      schema: 'carbox-project-submission-v2',
      project_name: projectName,
      project_owner: ownerWallet,
      proposed_co2_kg: proposedCO2Kg,
      requested_sal_amount: requestedSALAmount,
      kg_co2_per_sal: KG_CO2_PER_SAL,
      ...(projectType && { project_type: projectType }),
      ...(location && { location }),
      ...(methodology && { methodology }),
      ...(monitoringStart || monitoringEnd
        ? {
            monitoring_period: {
              ...(monitoringStart && { start: monitoringStart }),
              ...(monitoringEnd && { end: monitoringEnd }),
            },
          }
        : {}),
      documents,
      submitted_at: submittedAt,
    },
  };

  return {
    metadata,
    normalized: {
      projectName,
      ownerWallet,
      proposedCO2Kg,
      requestedSALAmount,
      documents,
    },
  };
};


const validateProjectMetadataAgainstSubmission = (
  metadata,
  { ownerWallet, proposedCO2Kg }
) => {
  if (!metadata || typeof metadata !== 'object') {
    return {
      status: 'UNAVAILABLE',
      errors: ['Không tải được project metadata từ projectURI'],
    };
  }

  const errors = [];
  const expectedOwner = ethers.getAddress(ownerWallet).toLowerCase();
  const metadataOwner = String(
    metadata?.properties?.project_owner || ''
  ).toLowerCase();
  const metadataCO2 = Number(metadata?.properties?.proposed_co2_kg);
  const expectedSAL = Number(proposedCO2Kg) / KG_CO2_PER_SAL;
  const metadataSAL = Number(metadata?.properties?.requested_sal_amount);

  if (metadata?.properties?.schema !== 'carbox-project-submission-v2') {
    errors.push('Metadata schema không phải carbox-project-submission-v2');
  }
  if (!ethers.isAddress(metadataOwner) || metadataOwner !== expectedOwner) {
    errors.push('project_owner trong metadata không khớp ví submit on-chain');
  }
  if (!Number.isSafeInteger(metadataCO2) || metadataCO2 !== Number(proposedCO2Kg)) {
    errors.push('proposed_co2_kg trong metadata không khớp event ProjectSubmitted');
  }
  if (!Number.isSafeInteger(metadataSAL) || metadataSAL !== expectedSAL) {
    errors.push('requested_sal_amount trong metadata không khớp quy đổi SAL');
  }

  return {
    status: errors.length ? 'INVALID' : 'VALID',
    errors,
  };
};

const createProjectSubmissionMetadata = async (payload) => {
  const built = buildProjectSubmissionMetadata(payload);
  const safeName = built.normalized.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'project';

  const pinned = await pinJSONToIPFS(
    built.metadata,
    `carbox-project-submission-${safeName}-${Date.now()}.json`
  );

  return {
    ...pinned,
    projectURI: pinned.uri,
    metadata: built.metadata,
    normalized: built.normalized,
  };
};

const createCarbonCreditMetadata = async ({ project, onChainProjectId, approvedCO2Kg }) => {
  const approved = parsePositiveInteger(approvedCO2Kg, 'approvedCO2Kg');
  const projectId = parsePositiveInteger(onChainProjectId, 'onChainProjectId');

  if (approved % KG_CO2_PER_SAL !== 0) {
    throw new Error(`approvedCO2Kg phải chia hết cho ${KG_CO2_PER_SAL} kg CO2e`);
  }

  const tokenAmount = approved / KG_CO2_PER_SAL;
  const metadata = {
    name: `CarboX SAL - ${project.projectName}`,
    description: `SAL issued for ${project.projectName}. Each ERC-1155 SAL represents 10 kg of verified CO2 reduction or removal.`,
    ...(project.projectMetadata?.image && { image: project.projectMetadata.image }),
    attributes: [
      { trait_type: 'Project ID', value: String(projectId) },
      { trait_type: 'Project Name', value: project.projectName },
      { trait_type: 'Approved CO2 (kg)', value: approved, display_type: 'number' },
      { trait_type: 'Minted Token Amount', value: tokenAmount, display_type: 'number' },
      { trait_type: 'CO2 per Token (kg)', value: KG_CO2_PER_SAL, display_type: 'number' },
      { trait_type: 'Token Standard', value: 'ERC-1155' },
    ],
    properties: {
      schema: 'carbox-sal-project-v2',
      project_id: projectId,
      project_owner: project.ownerWallet,
      project_document_uri: project.projectURI || project.ipfsHash,
      approved_co2_kg: approved,
      kg_co2_per_token: KG_CO2_PER_SAL,
      generated_at: new Date().toISOString(),
    },
  };

  const pinned = await pinJSONToIPFS(
    metadata,
    `carbox-project-${projectId}-token-metadata.json`
  );

  return { ...pinned, metadata };
};

module.exports = {
  KG_CO2_PER_SAL,
  buildProjectSubmissionMetadata,
  createCarbonCreditMetadata,
  createProjectSubmissionMetadata,
  validateProjectMetadataAgainstSubmission,
};
