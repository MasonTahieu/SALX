const express = require('express');
const { getHealthReport } = require('../services/healthService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const report = await getHealthReport();
    res.set('Cache-Control', 'no-store');
    return res.status(report.status === 'unhealthy' ? 503 : 200).json(report);
  } catch (error) {
    console.error('❌ Health check thất bại:', error.message);
    return res.status(503).json({
      status: 'unhealthy',
      checkedAt: new Date(),
      error: error.message,
    });
  }
});

module.exports = router;
