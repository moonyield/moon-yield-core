function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function testFlow(Moonbeam, MoonbeamSigner, Avalanche, AvalancheSigner) {
  let tx;

  const user = MoonbeamSigner.address;
  const HUB = Moonbeam.contracts.CrossYieldHubContract;
  const Vault = Moonbeam.contracts.VaultContract;
  const Dispatch = Avalanche.contracts.RemoteDispatchContract;

  //   console.log(`depositSymbol: ${await Dispatch.depositSymbol()}`);
  //   console.log(`depositToken: ${await Dispatch.depositToken()}`);
  //   return;

  const shareBalanceStart = await Vault.balanceOf(user);
  console.log(`axlUSDC on Avax: ${await Avalanche.axlUSDC.balanceOf(user)}`);
  console.log(`shares on Glmr: ${await Vault.balanceOf(user)}`);

  tx = await HUB.allowSource(
    "Avalanche",
    Avalanche.contracts.RemoteDispatchContract.address
  );
  await tx.wait();

  const amount = 10000000;
  // Approve axlUSDC on Avalanche.
  tx = await Avalanche.axlUSDC.approve(Dispatch.address, amount);
  await tx.wait();
  console.log("Approved axlUSDC");
  console.log(
    `Dispatch has allowance to spend: ${(
      await Avalanche.axlUSDC.allowance(user, Dispatch.address)
    ).toString()} axlUSDC`
  );
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
}

module.exports = {
  testFlow,
};
