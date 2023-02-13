const { forkAndExport } = require("@axelar-network/axelar-local-dev");
const { Wallet } = require("ethers");

require("dotenv").config();

async function createFork(toFund) {
  async function callback(chain, _) {
    for (const address of toFund) {
      await chain.giveToken(address, "uusdc", 10000000000);
      console.log(
        `${address} has ${await (
          await chain.getTokenContract("uusdc")
        ).balanceOf(address)} axlUSDC`
      );
    }
  }

  await forkAndExport({
    chains: ["Moonbeam", "Avalanche"],
    accountsToFund: toFund,
    callback: callback,
  });
}

if (require.main === module) {
  const deployer_key = process.env.EVM_PRIVATE_KEY;
  const deployer_address = new Wallet(deployer_key).address;
  const toFund = [deployer_address];

  createFork(toFund);
}
