async function testVault(Moonbeam, wallet) {
  console.log("[TEST Vault]");
  const user = wallet.address;
  const Vault = Moonbeam.contracts.VaultContract;
  const USDC = Moonbeam.USDC;
  const USDCbalance = await USDC.balanceOf(user);

  console.log("[want]    :", await Vault.want());
  console.log("[strategy]:", await Vault.strategy());

  let tx;

  tx = await USDC.approve(Vault.address, USDCbalance);
  await tx.wait();

  console.log("--- [test depositFor]");
  tx = await Vault.depositFor(USDCbalance, user);
  await tx.wait();

  console.log(
    "USDC after deposit      :",
    (await USDC.balanceOf(user)).toString()
  );
  const shareBalance = await Vault.balanceOf(user);
  console.log("Shares after deposit    :", shareBalance.toString());
  console.log(
    "USDC Balance of strategy:",
    (await USDC.balanceOf(await Vault.strategy())).toString()
  );

  console.log("--- [test withdraw]");
  tx = await Vault.withdraw(shareBalance);
  await tx.wait();

  console.log(
    "USDC balance after withdraw  :",
    (await USDC.balanceOf(user)).toString()
  );
  console.log(
    "Shares balance after withdraw:",
    (await Vault.balanceOf(user)).toString()
  );
  console.log(
    "USDC Balance of strategy     :",
    (await USDC.balanceOf(await Vault.strategy())).toString()
  );
  console.log("[TEST Vault END]");
}

module.exports = { testVault };
