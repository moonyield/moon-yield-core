const { createAndExport } = require("@axelar-network/axelar-local-dev");
const { Wallet } = require("ethers");

require("dotenv").config();

async function createLocal(toFund) {
  async function callback(chain, info) {
    await chain.deployToken("Axelar Wrapped aUSDC", "aUSDC", 6, BigInt(1e70));
    for (const address of toFund) {
      await chain.giveToken(address, "aUSDC", BigInt(1e18));
    }
  }

  await createAndExport({
    accountsToFund: toFund,
    chains: ["Moonbeam", "Avalanche"],
    callback: callback,
  });
}

module.exports = {
  createLocal,
};

if (require.main === module) {
  const deployer_key = process.env.EVM_PRIVATE_KEY;
  const deployer_address = new Wallet(deployer_key).address;
  const toFund = [deployer_address];

  createLocal(toFund);
}
