"use strict";

require("dotenv").config();

const { getDefaultProvider, Wallet } = require("ethers");

const { testConverter } = require("./utils/testConverter");
const { testVault } = require("./utils/testVault");
const { testFlow } = require("./utils/testFlow");

const { deployMoonbeam, deployRemoteChains } = require("./utils/deploy");

function sleep(ms) {
  return new Promise(() => {
    setTimeout(() => {
      resolve;
    }, ms);
  });
}

async function main() {
  const chains = require("../../local.json");
  const private_key = process.env.EVM_PRIVATE_KEY;
  const wallet = new Wallet(private_key);

  const Moonbeam = chains.find((c) => c.name === "Moonbeam");
  const RemoteChains = chains.filter((c) => c.name !== "Moonbeam");

  const MoonbeamSigner = wallet.connect(getDefaultProvider(Moonbeam.rpc));
  const HUB = await deployMoonbeam(Moonbeam, MoonbeamSigner);
  console.log(`HUB deployed at ${HUB}`);

  const promises = [];
  for (const chain of RemoteChains) {
    const provider = getDefaultProvider(chain.rpc);
    promises.push(deployRemoteChains(chain, wallet.connect(provider), HUB));
  }
  await Promise.all(promises);

  console.log("--- BEGIN TESTS ---");

  // testConverter(Moonbeam, MoonbeamSigner);
  testVault(Moonbeam, MoonbeamSigner);
  // testFlow(
  //   Moonbeam,
  //   MoonbeamSigner,
  //   RemoteChains[0],
  //   wallet.connect(getDefaultProvider(RemoteChains[0].rpc))
  // );
}

if (require.main === module) {
  main();
}
