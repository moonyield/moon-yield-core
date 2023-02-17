const hre = require("hardhat");

async function main() {
  const GATEWAY = "0x4F4495243837681061C4743b74B3eEdf548D56A5";
  const HUB = "0xfDd41d5C2f63787101027196b1eCFC6DA2aaB964";
  const VAULT = "0x9961CDF83F4Aa5805E933b94872ecD6f4a3CeCa7";
  const STRATEGY = "0x472EDB839c9D8224AbA522629636A809b50fc74E";
  const CONVERTER = "0x482544bC43cc0fc146BF7683F4CB28748B9Ee6E2";

  const tokenSymbol = "axlUSDC";

  // await hre.run("verify:verify", {
  //   address: CONVERTER,
  //   constructorArguments: [],
  // });

  await hre.run("verify:verify", {
    address: STRATEGY,
    constructorArguments: [
      "0x931715FEE2d06333043d11F658C8CE934aC61D0c",
      VAULT,
      CONVERTER,
    ],
  });

  await hre.run("verify:verify", {
    address: VAULT,
    constructorArguments: ["MoonYield USDC", "myUSDC"],
  });

  await hre.run("verify:verify", {
    address: HUB,
    constructorArguments: [GATEWAY, tokenSymbol, CONVERTER, VAULT],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
