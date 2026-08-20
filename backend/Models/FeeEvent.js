const mongoose = require('mongoose');

const feeEventSchema = new mongoose.Schema({
  eventKey: { type: String, required: true, unique: true, index: true },
  chainId: { type: Number, required: true, index: true },
  contractAddress: { type: String, required: true, lowercase: true },
  eventName: {
    type: String,
    required: true,
    enum: [
      'TokenizationDepositReceived',
      'TokenizationFeeCollected',
      'TokenizationFeeRefundCredited',
      'TokenizationFeeRefundWithdrawn',
      'CertificateMintFeeCollected',
      'TreasuryClaimed',
    ],
    index: true,
  },
  projectId: { type: Number, default: null, index: true },
  ownerAddress: { type: String, default: null, lowercase: true, index: true },
  salAmount: { type: Number, default: null },
  maximumSALAmount: { type: Number, default: null },
  certificateTokenId: { type: Number, default: null, index: true },
  feePerSALWei: { type: String, default: null },
  amountWei: { type: String, required: true },
  txHash: { type: String, required: true, lowercase: true, index: true },
  blockNumber: { type: Number, required: true },
  blockHash: { type: String, default: null },
  logIndex: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

module.exports = mongoose.model('FeeEvent', feeEventSchema);
