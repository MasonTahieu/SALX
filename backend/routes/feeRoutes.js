const express = require('express');
const { ethers } = require('ethers');
const FeeEvent = require('../Models/FeeEvent');

const router = express.Router();

router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({ error: 'projectId không hợp lệ' });
    }
    const events = await FeeEvent.find({ projectId }).sort({ blockNumber: 1, logIndex: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Không thể tải lịch sử phí' });
  }
});

router.get('/wallet/:address', async (req, res) => {
  try {
    if (!ethers.isAddress(req.params.address)) {
      return res.status(400).json({ error: 'Địa chỉ ví không hợp lệ' });
    }
    const events = await FeeEvent.find({ ownerAddress: req.params.address.toLowerCase() })
      .sort({ blockNumber: -1, logIndex: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Không thể tải lịch sử phí' });
  }
});

router.get('/tx/:txHash', async (req, res) => {
  try {
    const txHash = req.params.txHash.toLowerCase();
    if (!/^0x[a-f0-9]{64}$/.test(txHash)) {
      return res.status(400).json({ error: 'Transaction hash không hợp lệ' });
    }
    const events = await FeeEvent.find({ txHash }).sort({ logIndex: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Không thể tải lịch sử phí' });
  }
});

module.exports = router;
