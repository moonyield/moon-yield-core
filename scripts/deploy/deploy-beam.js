const hre = require("hardhat");

async function main() {
  let tx;
  const GATEWAY = "0x4F4495243837681061C4743b74B3eEdf548D56A5";
  const Strategy = await hre.ethers.getContractFactory("Strategy");
  const Vault = await hre.ethers.getContractFactory("Vault");
  const Converter = await hre.ethers.getContractFactory("Converter");
  const Hub = await hre.ethers.getContractFactory("CrossYieldHub");

  console.log("Deploying: Converter");
  const converter = await Converter.deploy();
  await converter.deployed();
  console.log("Deployed: Converter");

  console.log("Deploying: Vault");
  const vault = await Vault.deploy("MoonYield USDC", "myUSDC");
  await vault.deployed();
  console.log("Deployed: Vault");

  console.log("Deploying: Strategy");
  const strategy = await Strategy.deploy(
    "0x931715FEE2d06333043d11F658C8CE934aC61D0c",
    vault.address,
    converter.address
  );
  console.log("Deployed: Strategy");

  await strategy.deployed();

  tx = await vault.setStrategy(strategy.address);
  await tx.wait();

  console.log("Deploying: HUB");
  const hub = await Hub.deploy(
    GATEWAY,
    "axlUSDC",
    converter.address,
    vault.address
  );
  await hub.deployed();
  console.log("Deployed: HUB");

  console.log(
    `
    vault    : ${vault.address}
    strategy : ${strategy.address}
    converter: ${converter.address}
    hub      : ${hub.address}
    `
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
