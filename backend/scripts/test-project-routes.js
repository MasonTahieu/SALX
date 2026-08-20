const assert = require('assert');
const express = require('express');

process.env.ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'route-test-admin-key';

const projectRoutes = require('../routes/projectRoutes');

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

const run = async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}/api/projects`;

  try {
    const legacyCreate = await fetch(`${base}/create`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(legacyCreate.status, 410);

    const invalidMetadata = await fetch(`${base}/metadata`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectName: 'Invalid project',
        description: 'Invalid wallet is rejected before RPC or IPFS calls.',
        ownerWallet: 'invalid-wallet',
        proposedCO2Kg: 100,
      }),
    });
    assert.equal(invalidMetadata.status, 400);

    const legacyReject = await fetch(`${base}/reject/507f1f77bcf86cd799439011`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-admin-key': process.env.ADMIN_SECRET_KEY,
      },
      body: JSON.stringify({ reason: 'legacy' }),
    });
    assert.equal(legacyReject.status, 410);

    const invalidDelete = await fetch(`${base}/not-a-mongo-id`, {
      method: 'DELETE',
      headers: { 'x-admin-key': process.env.ADMIN_SECRET_KEY },
    });
    assert.equal(invalidDelete.status, 400);

    console.log('✅ Project route compatibility tests passed');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
