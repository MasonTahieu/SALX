const express = require('express');
const router = express.Router();
const Certificate = require('../Models/Certificate');

router.get('/', async (req, res) => {
  try {
    const topBurners = await Certificate.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $group: {
          _id: '$ownerAddress',
          totalRetired: { $sum: '$retiredTokenAmount' },
          totalRetiredCO2Kg: { $sum: '$retiredCO2Kg' },
          certificateCount: { $sum: 1 },
        },
      },
      { $sort: { totalRetired: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          parentWalletAddress: '$_id',
          totalRetired: 1,
          totalRetiredCO2Kg: 1,
          certificateCount: 1,
        },
      },
    ]);

    res.status(200).json({
      message: '🏆 Bảng xếp hạng Doanh nghiệp bù đắp Carbon',
      leaderboard: topBurners,
    });
  } catch (error) {
    console.error('❌ Lỗi truy xuất Leaderboard:', error);
    res.status(500).json({ error: 'Không thể tải bảng xếp hạng.' });
  }
});

module.exports = router;
