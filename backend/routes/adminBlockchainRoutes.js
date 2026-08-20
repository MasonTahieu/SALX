const express = require('express');
const { ethers } = require('ethers');
const {
  pauseMarketplaceOnChain,
  unpauseMarketplaceOnChain,
  blacklistProjectOnChain,
  unblacklistProjectOnChain,
  blacklistOwnerOnChain,
  unblacklistOwnerOnChain,
} = require('../services/blockchainService');

const router = express.Router();

router.use((req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Không có quyền Admin' });
  }
  next();
});

router.post('/pause', async (req, res) => {
  try { res.json(await pauseMarketplaceOnChain()); }
  catch (error) { res.status(400).json({ error: error.shortMessage || error.message }); }
});

router.post('/unpause', async (req, res) => {
  try { res.json(await unpauseMarketplaceOnChain()); }
  catch (error) { res.status(400).json({ error: error.shortMessage || error.message }); }
});

router.post('/projects/:projectId/blacklist', async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const reason = String(req.body.reason || '').trim();
    if (!Number.isSafeInteger(projectId) || projectId <= 0 || !reason) {
      return res.status(400).json({ error: 'projectId hoặc reason không hợp lệ' });
    }
    res.json(await blacklistProjectOnChain(projectId, reason));
  } catch (error) { res.status(400).json({ error: error.shortMessage || error.message }); }
});

router.post('/projects/:projectId/unblacklist', async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({ error: 'projectId không hợp lệ' });
    }
    res.json(await unblacklistProjectOnChain(projectId));
  } catch (error) { res.status(400).json({ error: error.shortMessage || error.message }); }
});

router.post('/owners/:address/blacklist', async (req, res) => {
  try {
    const address = req.params.address;
    const reason = String(req.body.reason || '').trim();
    if (!ethers.isAddress(address) || !reason) {
      return res.status(400).json({ error: 'Địa chỉ hoặc reason không hợp lệ' });
    }
    res.json(await blacklistOwnerOnChain(address, reason));
  } catch (error) { res.status(400).json({ error: error.shortMessage || error.message }); }
});

router.post('/owners/:address/unblacklist', async (req, res) => {
  try {
    const address = req.params.address;
    if (!ethers.isAddress(address)) return res.status(400).json({ error: 'Địa chỉ không hợp lệ' });
    res.json(await unblacklistOwnerOnChain(address));
  } catch (error) { res.status(400).json({ error: error.shortMessage || error.message }); }
});

module.exports = router;
