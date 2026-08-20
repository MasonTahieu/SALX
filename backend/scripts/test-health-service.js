require('dotenv').config();
const assert = require('assert');
const { getHealthReport } = require('../services/healthService');

const run = async () => {
  const originalRpcUrl = process.env.RPC_URL;
  delete process.env.RPC_URL;

  try {
    const report = await getHealthReport();
    assert.equal(report.status, 'unhealthy');
    assert.equal(report.components.blockchain.rpc.status, 'down');
    assert.ok(report.components.blockchain.rpc.error);
    assert.ok(report.components.blockchain.indexer.runtime);
    console.log('✅ Health service fallback test passed');
  } finally {
    if (originalRpcUrl !== undefined) process.env.RPC_URL = originalRpcUrl;
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
