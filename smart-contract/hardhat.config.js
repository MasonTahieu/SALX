import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

const compilerSettings = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
  viaIR: true,
};

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: compilerSettings,
      },
      production: {
        version: "0.8.28",
        settings: compilerSettings,
      },
    },
  },

  networks: {
    sepolia: {
      type: "http",
      chainId: 11155111,
      url:
        process.env.SEPOLIA_RPC_URL ||
        "https://rpc.sepolia.org",
      accounts: process.env.SEPOLIA_PRIVATE_KEY
        ? [process.env.SEPOLIA_PRIVATE_KEY]
        : [],
    },
  },
});