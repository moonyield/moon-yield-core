const { Contract, utils } = require("ethers");
const { ABIs } = require("./abi");

async function logBalances(address) {
  console.log("Balances:");
  console.log(`axlUSDC Balance: ${await Moonbeam.axlUSDC.balanceOf(address)}`);
  console.log(`USDC Balance: ${await Moonbeam.USDC.balanceOf(address)}`);
}

async function testConverter(Moonbeam, wallet) {
  const user = wallet.address;

  console.log("[test] Converter");

  const Converter = Moonbeam.contracts.ConverterContract;
  const tokens = await Converter.tokens();
  let swapTx, approveTx;

  console.log("--- [axlUSDCtoWormholeUSDC]");

  await logBalances(user);

  approveTx = await Moonbeam.axlUSDC.approve(Converter.address, 1000000);
  await approveTx.wait();

  swapTx = await Converter.axlUSDCtoWormholeUSDC(1000000);
  await swapTx.wait();

  await logBalances(user);

  console.log("--- [WormholeUSDCtoAxlUSDC]");
  await logBalances(user);

  approveTx = await Moonbeam.USDC.approve(Converter.address, 1000000);
  await approveTx.wait();

  swapTx = await Converter.WormholeUSDCtoAxlUSDC(1000000);
  await swapTx.wait();

  await logBalances(user);

  console.log("--- [WELLtoUSDC]");
  const WELL = new Contract(tokens.WELL, ABIs.ERC20.abi, wallet);
  const WELLBalance = await WELL.balanceOf(user);

  const swapAmount = WELLBalance;
  approveTx = await WELL.approve(Converter.address, swapAmount);
  await approveTx.wait();
  console.log(`USDC before swap: ${await Moonbeam.USDC.balanceOf(user)}`);
  swapTx = await Converter.WELLToWormholeUSDC(swapAmount);
  await swapTx.wait();
  console.log(`USDC after swap: ${await Moonbeam.USDC.balanceOf(user)}`);

  console.log("--- [GLMRtoUSDC]");
  let sAmount = utils.parseEther("5");
  console.log(`USDC before swap: ${await Moonbeam.USDC.balanceOf(user)}`);
  swapTx = await Converter.GLMRtoWormholeUSDC(sAmount, { value: sAmount });
  await swapTx.wait();
  console.log(`USDC after swap: ${await Moonbeam.USDC.balanceOf(user)}`);

  console.log("---------------");
}

module.exports = { testConverter };
