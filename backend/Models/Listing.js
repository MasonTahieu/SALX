const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    chainId: { type: Number, required: true, index: true },
    marketplaceContractAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    listingId: { type: Number, required: true, index: true },
    projectId: { type: Number, required: true, index: true },
    sellerAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    initialAmount: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    pricePerUnitWei: { type: String, required: true },
    pricePerUnitETH: { type: String, required: true },
    active: { type: Boolean, required: true, index: true },
    createdTxHash: { type: String, lowercase: true, default: null },
    createdBlockNumber: { type: Number, default: null },
    createdOnChainAt: { type: Date, default: null },
    updatedTxHash: { type: String, lowercase: true, default: null },
    updatedBlockNumber: { type: Number, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

listingSchema.index(
  { chainId: 1, marketplaceContractAddress: 1, listingId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Listing', listingSchema);
