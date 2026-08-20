import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config({ override: true });

const rpcUrl = (process.env.SEPOLIA_RPC_URL ?? "").trim();
let privateKey = (process.env.SEPOLIA_PRIVATE_KEY ?? "").trim();
if (privateKey && !privateKey.startsWith("0x")) privateKey = `0x${privateKey}`;

if (!rpcUrl) throw new Error("Thiếu SEPOLIA_RPC_URL trong .env");
if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  throw new Error("SEPOLIA_PRIVATE_KEY không đúng định dạng 0x + 64 ký tự hex");
}

const addressesPath = path.resolve(
  "ignition/deployments/chain-11155111/deployed_addresses.json",
);
if (!fs.existsSync(addressesPath)) {
  throw new Error(`Không tìm thấy ${addressesPath}`);
}

const deployed = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
const findAddress = (contractName) => {
  const entry = Object.entries(deployed).find(([key]) =>
    key.endsWith(`#${contractName}`),
  );
  if (!entry) throw new Error(`Không tìm thấy địa chỉ ${contractName}`);
  return entry[1];
};

const salAddress = findAddress("SAL1155");
const certificateAddress = findAddress("GreenCertificateSBT");
const marketplaceAddress = findAddress("SALMarketplace");

const loadAbi = (relativePath) => {
  const artifact = JSON.parse(
    fs.readFileSync(path.resolve(relativePath), "utf8"),
  );
  return artifact.abi;
};

const salAbi = loadAbi("artifacts/contracts/SAL1155.sol/SAL1155.json");
const certificateAbi = loadAbi(
  "artifacts/contracts/GreenCertificateSBT.sol/GreenCertificateSBT.json",
);

const provider = new ethers.JsonRpcProvider(rpcUrl);
const network = await provider.getNetwork();
if (network.chainId !== 11155111n) {
  throw new Error(`RPC đang trỏ tới chainId ${network.chainId}, không phải Sepolia`);
}

const wallet = new ethers.Wallet(privateKey, provider);
const sal = new ethers.Contract(salAddress, salAbi, wallet);
const certificate = new ethers.Contract(certificateAddress, certificateAbi, wallet);

console.log("Deployer:", wallet.address);
console.log("SAL1155:", salAddress);
console.log("GreenCertificateSBT:", certificateAddress);
console.log("SALMarketplace:", marketplaceAddress);

async function wireAndLock(contract, label) {
  const owner = await contract.owner();
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`${label}: ví hiện tại không phải owner (${owner})`);
  }

  const lockedBefore = await contract.marketplaceLocked();
  const currentBefore = await contract.marketplace();

  if (lockedBefore) {
    if (currentBefore.toLowerCase() !== marketplaceAddress.toLowerCase()) {
      throw new Error(`${label}: đã khóa với marketplace khác: ${currentBefore}`);
    }
    console.log(`${label}: đã set và khóa đúng, bỏ qua.`);
    return;
  }

  if (currentBefore === ethers.ZeroAddress) {
    console.log(`${label}: đang gọi setMarketplace...`);
    const setTx = await contract.setMarketplace(marketplaceAddress);
    console.log(`${label} set tx:`, setTx.hash);
    await setTx.wait();
  } else if (currentBefore.toLowerCase() !== marketplaceAddress.toLowerCase()) {
    throw new Error(`${label}: đang trỏ tới marketplace khác: ${currentBefore}`);
  } else {
    console.log(`${label}: marketplace đã được set đúng.`);
  }

  const currentAfterSet = await contract.marketplace();
  if (currentAfterSet.toLowerCase() !== marketplaceAddress.toLowerCase()) {
    throw new Error(`${label}: xác minh setMarketplace thất bại`);
  }

  console.log(`${label}: đang gọi lockMarketplace...`);
  const lockTx = await contract.lockMarketplace();
  console.log(`${label} lock tx:`, lockTx.hash);
  await lockTx.wait();

  const lockedAfter = await contract.marketplaceLocked();
  if (!lockedAfter) throw new Error(`${label}: xác minh lockMarketplace thất bại`);
  console.log(`${label}: cấu hình hoàn tất.`);
}

await wireAndLock(sal, "SAL1155");
await wireAndLock(certificate, "GreenCertificateSBT");

console.log("\nHOÀN TẤT: SAL1155 và GreenCertificateSBT đã trỏ tới Marketplace và được khóa.");
