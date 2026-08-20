export type NetworkOption = {
  id: number;
  name: string;
  shortName: string;
  symbol: string;
  icon: string;
  accent: string;
  rpcUrl?: string;
  explorerUrl?: string;
};

export const NETWORKS: NetworkOption[] = [
  {
    id: 11155111,
    name: 'Sepolia',
    shortName: 'Sepolia',
    symbol: 'ETH',
    icon: 'Ξ',
    accent: '#627eea',
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  {
    id: 1,
    name: 'Ethereum',
    shortName: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    accent: '#627eea',
    rpcUrl: 'https://ethereum.publicnode.com',
    explorerUrl: 'https://etherscan.io',
  },
  {
    id: 137,
    name: 'Polygon',
    shortName: 'Polygon',
    symbol: 'POL',
    icon: '◆',
    accent: '#8247e5',
    rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
    explorerUrl: 'https://polygonscan.com',
  },
  {
    id: 10,
    name: 'Optimism',
    shortName: 'Optimism',
    symbol: 'ETH',
    icon: 'OP',
    accent: '#ff0420',
    rpcUrl: 'https://optimism-rpc.publicnode.com',
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  {
    id: 42161,
    name: 'Arbitrum',
    shortName: 'Arbitrum',
    symbol: 'ETH',
    icon: 'A',
    accent: '#2d8cff',
    rpcUrl: 'https://arbitrum-one-rpc.publicnode.com',
    explorerUrl: 'https://arbiscan.io',
  },
  {
    id: 8453,
    name: 'Base',
    shortName: 'Base',
    symbol: 'ETH',
    icon: '○',
    accent: '#0052ff',
    rpcUrl: 'https://base-rpc.publicnode.com',
    explorerUrl: 'https://basescan.org',
  },
];

export function networkById(chainId: number | null | undefined) {
  return NETWORKS.find((network) => network.id === chainId) || null;
}
