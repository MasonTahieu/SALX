require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const leaderboardRoutes = require('./routes/leaderboardRoutes');
const projectRoutes = require('./routes/projectRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const feeRoutes = require('./routes/feeRoutes');
const adminBlockchainRoutes = require('./routes/adminBlockchainRoutes');
const healthRoutes = require('./routes/healthRoutes');
const listingRoutes = require('./routes/listingRoutes');
const { startBlockchainIndexer } = require('./services/blockchainListener');
const redisClient = require('./config/redis');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/status', healthRoutes); // backward-compatible alias

app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/admin/blockchain', adminBlockchainRoutes);
app.use('/api/listings', listingRoutes);

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Lỗi hệ thống không xác định' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('⏳ Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Đã kết nối MongoDB');

    if (!redisClient.isOpen) {
      try {
        await redisClient.connect();
        console.log('✅ Đã kết nối Redis');
      } catch (redisError) {
        // Redis chỉ dùng cache, backend vẫn hoạt động nếu Redis tạm thời lỗi.
        console.warn(
          `⚠️ Redis không khả dụng, tiếp tục không cache: ${redisError.message}`
        );
      }
    }

    // Mở HTTP server trước để health/API vẫn phản hồi trong lúc indexer quét lịch sử.
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);

      // Indexer chạy nền; lỗi RPC/indexer không được làm Express ngừng phục vụ.
      startBlockchainIndexer().catch((error) => {
        console.error(
          '❌ Blockchain indexer khởi động thất bại:',
          error?.message || error
        );
      });
    });

    server.on('error', (error) => {
      console.error('❌ HTTP server khởi động thất bại:', error.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Lỗi khởi động hệ thống:', err.message);
    process.exit(1);
  }
};

startServer();
