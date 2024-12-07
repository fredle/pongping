// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("ethers");


module.exports = buildModule("CoinTossModule", (m) => {

  const coinToss = m.contract("CoinToss", [], {
    value: ethers.parseEther("0.001"), // Specify the value in Ether (e.g., 1 ETH)
  });

  return { coinToss };
});
