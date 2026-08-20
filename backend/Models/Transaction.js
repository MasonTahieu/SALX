const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Một transaction blockchain có thể phát nhiều event, vì vậy không unique riêng txHash.
  eventKey: { type: String, required: true, unique: true, index: true },
  chainId: { type: Number, required: true, index: true },
  contractAddress: { type: String, required: true, lowercase: true },
  eventName: { type: String, required: true },
  txHash: { type: String, required: true, lowercase: true, index: true },
  fromAddress: { type: String, required: true, lowercase: true, index: true },
  toAddress: { type: String, required: true, lowercase: true, index: true },
  amount: { type: Number, required: true },
  transactionType: {
    type: String,
    enum: ['MINT', 'TRANSFER', 'RETIRE', 'BURN'],
    required: true,
    index: true,
  },
  projectId: { type: Number, default: null, index: true },
  listingId: { type: Number, default: null },
  co2Kg: { type: Number, default: null },
  certificateTokenId: { type: Number, default: null, index: true },
  certificateURI: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  totalPriceWei: { type: String, default: null },
  feeWei: { type: String, default: null },
  ipfsHash: { type: String, default: null },
  blockNumber: { type: Number, required: true },
  blockHash: { type: String, default: null },
  logIndex: { type: Number, required: true },
  timestamp: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
