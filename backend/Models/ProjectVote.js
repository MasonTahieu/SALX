const mongoose = require('mongoose');

const projectVoteSchema = new mongoose.Schema(
  {
    chainId: { type: Number, required: true, index: true },
    marketplaceContractAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    projectId: { type: Number, required: true, index: true },
    validatorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    approved: { type: Boolean, required: true },
    txHash: { type: String, required: true, lowercase: true },
    blockNumber: { type: Number, required: true },
    blockHash: { type: String, default: null },
    logIndex: { type: Number, required: true },
    votedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

projectVoteSchema.index(
  {
    chainId: 1,
    marketplaceContractAddress: 1,
    projectId: 1,
    validatorAddress: 1,
  },
  { unique: true }
);

module.exports = mongoose.model('ProjectVote', projectVoteSchema);
