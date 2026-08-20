import type { Project } from '../types/domain';

const property = (project: Project, key: string) => project.projectMetadata?.properties?.[key];

export function projectDisplay(project?: Project) {
  const meta = project?.projectMetadata || {};
  const props = meta.properties || {};
  const monitoring = props.monitoring_period || {};
  return {
    description: String(meta.description || ''),
    image: String(meta.image || ''),
    projectType: String(props.project_type || ''),
    location: String(props.location || ''),
    methodology: String(props.methodology || ''),
    monitoringStart: String(monitoring.start || ''),
    monitoringEnd: String(monitoring.end || ''),
  };
}

export function ipfsToHttp(uri?: string | null) {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.slice('ipfs://'.length)}`;
  return uri;
}

export function projectAttribute(project: Project, trait: string) {
  const attributes = Array.isArray(project.projectMetadata?.attributes) ? project.projectMetadata?.attributes : [];
  const match = attributes.find((item: any) => String(item?.trait_type).toLowerCase() === trait.toLowerCase());
  return match?.value == null ? '' : String(match.value);
}

export function projectSearchText(project?: Project) {
  if (!project) return '';
  const details = projectDisplay(project);
  return [project.projectName, project.onChainProjectId, details.projectType, details.location, details.methodology]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function projectMetadataIsValid(project?: Project) {
  return project?.metadataValidationStatus === 'VALID';
}
