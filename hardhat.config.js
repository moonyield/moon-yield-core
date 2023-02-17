require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  paths: {
    sources: "./contracts",
  },
  networks: {
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [process.env.EVM_PRIVATE_KEY],
    },
    moonbeam: {
      url: "https://rpc.api.moonbeam.network",
      accounts: [process.env.EVM_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      avalanche: process.env.AVAX_SCAN,
      moonbeam: process.env.MOON_SCAN,
    },
  },
};
