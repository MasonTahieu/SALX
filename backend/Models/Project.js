const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    chainId: {
      type: Number,
      default: null,
      index: true,
    },
    marketplaceContractAddress: {
      type: String,
      default: null,
      lowercase: true,
      index: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    ownerWallet: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    ipfsHash: {
      type: String,
      required: true,
    },
    projectURI: {
      type: String,
      default: null,
    },
    projectMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    metadataValidationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VALID', 'INVALID', 'UNAVAILABLE'],
      default: 'UNVERIFIED',
      index: true,
    },
    metadataValidationErrors: {
      type: [String],
      default: [],
    },
    metadataValidatedAt: {
      type: Date,
      default: null,
    },
    tokenURI: {
      type: String,
      default: null,
    },
    tokenMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    totalCarbon: {
      type: Number,
      required: true,
    },
    proposedCO2Kg: {
      type: Number,
      default: null,
    },
    approvedCO2Kg: {
      type: Number,
      default: null,
    },
    mintedTokenAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    onChainProjectId: {
      type: Number,
      default: null,
      index: true,
    },
    approvalVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    rejectionVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    listedTokens: {
      type: Number,
      default: 0,
    },
    soldTokens: {
      type: Number,
      default: 0,
    },
    activeListingId: {
      type: Number,
      default: null,
      index: true,
    },
    pricePerCredit: {
      type: String,
      default: null,
    },
    rejectReason: {
      type: String,
      default: null,
    },
    eligibleValidatorCount: {
      type: Number,
      default: 0,
    },
    approvalQuorum: {
      type: Number,
      default: 0,
    },
    blacklisted: {
      type: Boolean,
      default: false,
      index: true,
    },
    blacklistReason: {
      type: String,
      default: null,
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    tokenizationDepositWei: {
      type: String,
      default: null,
    },
    tokenizationFeeChargedWei: {
      type: String,
      default: null,
    },
    tokenizationRefundWei: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

projectSchema.index(
  {
    chainId: 1,
    marketplaceContractAddress: 1,
    onChainProjectId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      chainId: { $type: 'number' },
      marketplaceContractAddress: { $type: 'string' },
      onChainProjectId: { $type: 'number' },
    },
  }
);

module.exports = mongoose.model('Project', projectSchema);
