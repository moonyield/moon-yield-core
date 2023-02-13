async function testConverter(Moonbeam, wallet) {
  const user = wallet.address;
  async function logBalances(address) {
    console.log("Balances:");
    console.log(
      `axlUSDC Balance: ${await Moonbeam.axlUSDC.balanceOf(address)}`
    );
    console.log(`USDC Balance: ${await Moonbeam.USDC.balanceOf(address)}`);
  }

  console.log("[test] Converter");

  const Converter = Moonbeam.contracts.ConverterContract;
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

  console.log("---------------");
}

module.exports = { testConverter };
