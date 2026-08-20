const numberEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  apiUrl: (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, ''),
  chainId: numberEnv(import.meta.env.VITE_CHAIN_ID, 11155111),
  chainName: import.meta.env.VITE_CHAIN_NAME || 'Sepolia',
  rpcUrl: import.meta.env.VITE_RPC_URL || '',
  blockExplorerUrl: (import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://sepolia.etherscan.io').replace(/\/$/, ''),
  marketplaceAddress: import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS || '',
  sal1155Address: import.meta.env.VITE_SAL1155_CONTRACT_ADDRESS || '',
  certificateAddress: import.meta.env.VITE_CERTIFICATE_SBT_CONTRACT_ADDRESS || '',
};

export const assertPublicContractConfig = () => {
  const missing = [
    ['VITE_MARKETPLACE_CONTRACT_ADDRESS', env.marketplaceAddress],
    ['VITE_SAL1155_CONTRACT_ADDRESS', env.sal1155Address],
    ['VITE_CERTIFICATE_SBT_CONTRACT_ADDRESS', env.certificateAddress],
  ].filter(([, value]) => !value || value === '0x...');

  if (missing.length) {
    throw new Error(`Thiếu cấu hình frontend: ${missing.map(([key]) => key).join(', ')}`);
  }
};
