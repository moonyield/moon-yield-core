const hre = require("hardhat");

async function main() {
  const gateway = "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78";
  const gasService = "0x2d5d7d31F671F86C782533cc367F14109a082712";
  const HUB = "0xfDd41d5C2f63787101027196b1eCFC6DA2aaB964";
  const tokenSymbol = "axlUSDC";

  const DispatchFactory = await hre.ethers.getContractFactory("RemoteDispatch");
  console.log(DispatchFactory);
  const dispatch = await DispatchFactory.deploy(
    gateway,
    gasService,
    HUB,
    tokenSymbol
  );

  await dispatch.deployed();
  console.log(`dispatch: ${dispatch.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
