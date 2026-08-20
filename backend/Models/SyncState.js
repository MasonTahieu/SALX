const mongoose = require('mongoose');

const syncStateSchema = new mongoose.Schema({
  // key = `${chainId}:${contractAddress}`. Khi đổi contract, indexer tự tạo state mới.
  key: { type: String, required: true, unique: true },
  contractName: { type: String, required: true },
  contractAddress: { type: String, required: true, lowercase: true },
  chainId: { type: Number, required: true },
  lastProcessedBlock: { type: Number, required: true },
  lastProcessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('SyncState', syncStateSchema);
