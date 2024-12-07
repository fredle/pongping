require("@nomicfoundation/hardhat-toolbox");


const privateKey = "42c8b417b9eb38f218618d548577993edc92f46c63c146a881648199a4df3dd8"
const ETHERSCAN_API_KEY = "TWWVPDF7JXNVG4G47FTMUQEAGDMVKX2MEJ"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "local",
  networks: {
    local: {
      url: "http://localhost:8545/",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
    hardhat: {
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/b018e54a0aa3433290f38dd732c6273e",
      accounts: [privateKey]
    },
    basenetsepolia: {
      url: "https://base-sepolia.infura.io/v3/b018e54a0aa3433290f38dd732c6273e",
      accounts: [privateKey]
    },
    basenet: {
      url: "https://base-mainnet.infura.io/v3/b018e54a0aa3433290f38dd732c6273e",
      accounts: [privateKey]
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};