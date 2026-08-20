const mongoose = require('mongoose');

const certificateSourceSchema = new mongoose.Schema({
  projectId: {
    type: Number,
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  retiredTokenAmount: {
    type: Number,
    required: true,
  },
  retiredCO2Kg: {
    type: Number,
    required: true,
  },
}, { _id: false });

const certificateSchema = new mongoose.Schema({
  draftKey: {
    type: String,
    default: null,
    index: true,
  },
  metadataRequestId: {
    type: String,
    index: true,
    unique: true,
    sparse: true,
  },
  chainId: {
    type: Number,
    required: true,
    index: true,
  },
  certificateContractAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  certificateTokenId: {
    type: Number,
    default: null,
    index: true,
  },
  ownerAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },

  // Backward-compatible field:
  // - single-project retirement => projectId của dự án
  // - multi-project retirement => 0
  projectId: {
    type: Number,
    required: true,
    index: true,
  },
  projectName: {
    type: String,
    required: true,
  },

  // Multi-project fields.
  projectCount: {
    type: Number,
    default: 1,
    min: 1,
    max: 5,
  },
  sources: {
    type: [certificateSourceSchema],
    default: [],
  },
  retirementBasketKey: {
    type: String,
    default: null,
    index: true,
  },

  // Totals across all selected projects.
  retiredTokenAmount: {
    type: Number,
    required: true,
  },
  retiredCO2Kg: {
    type: Number,
    required: true,
  },
  certificateURI: {
    type: String,
    required: true,
    index: true,
  },
  metadataNonce: {
    type: Number,
    default: null,
  },
  metadataDeadline: {
    type: Number,
    default: null,
  },
  metadataSignature: {
    type: String,
    default: null,
  },
  metadataSignerAddress: {
    type: String,
    default: null,
    lowercase: true,
  },
  metadataCID: {
    type: String,
    default: null,
  },
  imageURI: {
    type: String,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  txHash: {
    type: String,
    default: null,
    lowercase: true,
    index: true,
  },
  blockNumber: {
    type: Number,
    default: null,
  },
  blockHash: {
    type: String,
    default: null,
  },
  logIndex: {
    type: Number,
    default: null,
  },
  mintedAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED'],
    default: 'PENDING',
    index: true,
  },
  consumedAt: {
    type: Date,
    default: null,
  },
  expiredAt: {
    type: Date,
    default: null,
  },
  revokedReason: {
    type: String,
    default: null,
  },
  lastSyncedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

certificateSchema.index(
  { draftKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      draftKey: { $type: 'string' },
      status: 'PENDING',
    },
  }
);

certificateSchema.index(
  { chainId: 1, certificateContractAddress: 1, certificateTokenId: 1 },
  {
    unique: true,
    partialFilterExpression: { certificateTokenId: { $type: 'number' } },
  }
);

module.exports = mongoose.model('Certificate', certificateSchema);
