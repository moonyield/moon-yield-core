function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function testFlow(Moonbeam, MoonbeamSigner, Avalanche, AvalancheSigner) {
  console.log("[TEST COMPLETE FLOW]");
  let tx;

  const user = MoonbeamSigner.address;
  const HUB = Moonbeam.contracts.CrossYieldHubContract;
  const Vault = Moonbeam.contracts.VaultContract;
  const Dispatch = Avalanche.contracts.RemoteDispatchContract;

  const shareBalanceStart = await Vault.balanceOf(user);
  console.log(`axlUSDC on Avax: ${await Avalanche.axlUSDC.balanceOf(user)}`);
  console.log(`shares on Glmr: ${await Vault.balanceOf(user)}`);

  tx = await HUB.allowSource(
    "Avalanche",
    Avalanche.contracts.RemoteDispatchContract.address
  );
  await tx.wait();

  console.log("--- [test Cross-chain Deposit]");
  const amount = 10000000;
  // Approve axlUSDC on Avalanche.
  tx = await Avalanche.axlUSDC.approve(Dispatch.address, amount);
  await tx.wait();
  console.log("Approved axlUSDC");

  // Deposit on Avalanche
  tx = await Dispatch.deposit(amount, { value: 3 * 1e6 });
  await tx.wait();

  let shareBalance;
  while (true) {
    shareBalance = await Vault.balanceOf(user);
    if (shareBalance.toString() !== shareBalanceStart.toString()) break;

    console.log(`shares: ${shareBalance.toString()}`);
    await sleep(2000);
  }
  console.log(`axlUSDC on Avax: ${await Avalanche.axlUSDC.balanceOf(user)}`);
  console.log(`shares on Glmr: ${await Vault.balanceOf(user)}`);
  const axlUSDCAfterDeposit = await Avalanche.axlUSDC.balanceOf(user);

  console.log("--- [test Cross-chain withdrawal]");
  tx = await Vault.approve(HUB.address, shareBalance);
  await tx.wait();
  console.log("Approved vault shares");

  tx = await HUB.exitPosition("Avalanche", shareBalance);
  await tx.wait();

  let axlUSDCBal;
  while (true) {
    axlUSDCBal = await Avalanche.axlUSDC.balanceOf(user);
    if (axlUSDCBal.toString() !== axlUSDCAfterDeposit.toString()) break;
    console.log(`axlUSDC: ${axlUSDCBal.toString()}`);

    await sleep(2000);
  }

  console.log(`axlUSDC on Avax: ${await Avalanche.axlUSDC.balanceOf(user)}`);
}

module.exports = {
  testFlow,
};
