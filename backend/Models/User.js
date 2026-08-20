const mongoose = require('mongoose');

const childWalletSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      default: 'Ví phụ',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    parentWalletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    childWallets: {
      type: [childWalletSchema],
      default: [],
    },
    notificationConfig: {
      emailAlerts: { type: Boolean, default: true },
      inAppAlerts: { type: Boolean, default: false },
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRetired: {
      type: Number,
      default: 0,
      min: 0,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    blacklistReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
