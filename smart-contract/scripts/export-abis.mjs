import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const smartContractDir = path.resolve(scriptDir, '..');

// Mặc định project hiện tại có cấu trúc:
// CarboX-SAL-v2-configured/
// ├── backend/
// └── smart-contract/
// Có thể override bằng BACKEND_DIR nếu cần.
const backendDir = process.env.BACKEND_DIR
  ? path.resolve(process.cwd(), process.env.BACKEND_DIR)
  : path.resolve(smartContractDir, '../backend');

const contracts = [
  ['SAL1155', 'artifacts/contracts/SAL1155.sol/SAL1155.json'],
  ['SALMarketplace', 'artifacts/contracts/SALMarketplace.sol/SALMarketplace.json'],
  ['GreenCertificateSBT', 'artifacts/contracts/GreenCertificateSBT.sol/GreenCertificateSBT.json'],
];

const targetDir = path.resolve(backendDir, 'abis');
fs.mkdirSync(targetDir, { recursive: true });

for (const [contractName, artifactRelativePath] of contracts) {
  const artifactPath = path.resolve(smartContractDir, artifactRelativePath);

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Không tìm thấy artifact của ${contractName}: ${artifactPath}. ` +
      'Hãy chạy npx hardhat compile trước.'
    );
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  if (!Array.isArray(artifact.abi)) {
    throw new Error(`Artifact ${contractName} không chứa ABI hợp lệ`);
  }

  const targetPath = path.join(targetDir, `${contractName}.json`);
  fs.writeFileSync(
    targetPath,
    JSON.stringify({ contractName, abi: artifact.abi }, null, 2) + '\n'
  );

  console.log(`Exported ${contractName} ABI -> ${targetPath}`);
}
