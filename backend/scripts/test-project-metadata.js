const assert = require('assert');
const {
  buildProjectSubmissionMetadata,
  KG_CO2_PER_SAL,
} = require('../services/projectMetadataService');

const validWallet = '0x000000000000000000000000000000000000dEaD';

const result = buildProjectSubmissionMetadata({
  projectName: 'Demo Reforestation Project',
  description: 'A deterministic metadata builder test.',
  ownerWallet: validWallet,
  proposedCO2Kg: 1000,
  projectType: 'Reforestation',
  location: 'Vietnam',
  methodology: 'Demo methodology',
  documents: [
    {
      name: 'Monitoring report',
      uri: 'bafybeigdyrzt4examplecid',
    },
  ],
});

assert.equal(result.metadata.name, 'Demo Reforestation Project');
assert.equal(result.normalized.proposedCO2Kg, 1000);
assert.equal(result.normalized.requestedSALAmount, 1000 / KG_CO2_PER_SAL);
assert.equal(result.metadata.properties.schema, 'carbox-project-submission-v2');
assert.ok(result.metadata.properties.documents[0].uri.startsWith('ipfs://'));

assert.throws(
  () =>
    buildProjectSubmissionMetadata({
      projectName: 'Invalid amount',
      description: 'Amount is not divisible by 10.',
      ownerWallet: validWallet,
      proposedCO2Kg: 15,
    }),
  /chia hết/
);

assert.throws(
  () =>
    buildProjectSubmissionMetadata({
      projectName: 'Invalid wallet',
      description: 'Wallet validation test.',
      ownerWallet: 'not-an-address',
      proposedCO2Kg: 100,
    }),
  /địa chỉ Ethereum/
);

console.log('✅ Project metadata builder tests passed');
