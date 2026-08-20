require('dotenv').config();
const mongoose = require('mongoose');
const SyncState = require('../Models/SyncState');

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('Thiếu MONGODB_URI');
  await mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const names = new Set(collections.map((item) => item.name));

  if (names.has('transactions')) {
    const indexes = await db.collection('transactions').indexes();
    for (const index of indexes) {
      if (index.unique && index.key?.txHash === 1 && Object.keys(index.key).length === 1) {
        await db.collection('transactions').dropIndex(index.name);
        console.log(`✅ Đã xóa index cũ ${index.name} trên transactions.txHash`);
      }
    }
  }

  // Khi đổi sang contract SAL v2 phải quét lại từ deployment block mới.
  // Xóa toàn bộ state cũ để không vô tình bỏ qua event của địa chỉ vừa deploy.
  const result = await SyncState.deleteMany({});
  console.log(`✅ Đã reset ${result.deletedCount} syncstate cũ`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('❌ Migration thất bại:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
