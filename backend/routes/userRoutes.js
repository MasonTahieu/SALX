const express = require('express');
const { ethers } = require('ethers');
const User = require('../Models/User');

const router = express.Router();

const normalizeWallet = (value, fieldName) => {
  if (!ethers.isAddress(value || '')) {
    throw new Error(`${fieldName} không phải địa chỉ Ethereum hợp lệ`);
  }
  return ethers.getAddress(value).toLowerCase();
};

const normalizeEmail = (value) => {
  const email = String(value || '').trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Email không hợp lệ');
  }
  return email;
};

router.post('/create', async (req, res) => {
  try {
    const {
      email,
      parentWalletAddress,
      childWallets,
      notificationConfig,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const normalizedParentWallet = normalizeWallet(
      parentWalletAddress,
      'parentWalletAddress'
    );

    const normalizedChildWallets = Array.isArray(childWallets)
      ? childWallets.map((wallet, index) => ({
          address: normalizeWallet(
            wallet?.address,
            `childWallets[${index}].address`
          ),
          label: String(wallet?.label || 'Ví phụ').trim().slice(0, 80),
        }))
      : [];

    const allWallets = [
      normalizedParentWallet,
      ...normalizedChildWallets.map((wallet) => wallet.address),
    ];
    if (new Set(allWallets).size !== allWallets.length) {
      return res.status(400).json({
        error: 'Ví chính và các ví phụ không được trùng nhau',
      });
    }

    const newUser = new User({
      email: normalizedEmail,
      parentWalletAddress: normalizedParentWallet,
      childWallets: normalizedChildWallets,
      notificationConfig: {
        emailAlerts: notificationConfig?.emailAlerts !== false,
        inAppAlerts: notificationConfig?.inAppAlerts === true,
      },
      balance: 0,
      totalRetired: 0,
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      message: 'Tạo tài khoản thành công!',
      user: savedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email hoặc địa chỉ ví này đã tồn tại trong hệ thống!',
      });
    }

    return res.status(400).json({
      error: 'Lỗi tạo tài khoản',
      details: error.message,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
