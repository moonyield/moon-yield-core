async function testVault(Moonbeam, wallet) {
  console.log("[TEST Vault]");
  const user = wallet.address;

  const Vault = Moonbeam.contracts.VaultContract;
  const Strategy = Moonbeam.contracts.StrategyContract;
  const USDC = Moonbeam.USDC;
  const mUSDC = Moonbeam.mUSDC;
  const USDCbalance = await USDC.balanceOf(user);

  console.log("[user]                :", user);
  console.log("[want]                :", await Vault.want());
  console.log("[strategy]            :", await Vault.strategy());
  console.log(`[vault]               : ${Vault.address}`);
  console.log(`[USDC]                : ${USDCbalance.toString()}`);
  console.log(`[vault.balance()]     : ${(await Vault.balance()).toString()}`);
  console.log(
    `[vault.totalSupply()] : ${(await Vault.totalSupply()).toString()}`
  );
  console.log(
    `[strategy.balanceOf()]: ${(await Strategy.balanceOf()).toString()}`
  );

  let tx;

  tx = await USDC.approve(Vault.address, USDCbalance);
  await tx.wait();

  console.log("--- [test depositFor]");
  tx = await Vault.depositFor(USDCbalance, user);
  await tx.wait();

  console.log("------ DEPOSITED");
  console.log("------ [USDC]:", (await USDC.balanceOf(user)).toString());
  let shareBalance = await Vault.balanceOf(user);
  console.log("------ [shares]:", shareBalance.toString());
  console.log(
    "------ [mUSDC]:",
    (await mUSDC.balanceOf(await Vault.strategy())).toString()
  );
  console.log(
    `------ [vault.balance()]: ${(await Vault.balance()).toString()}`
  );
  console.log(
    `------ [strategy.balanceOf()]: ${(await Strategy.balanceOf()).toString()}`
  );
  console.log(
    `[vault.totalSupply()] : ${(await Vault.totalSupply()).toString()}`
  );

  console.log("--- [test withdraw]");
  shareBalance = await Vault.balanceOf(user);
  console.log(`------ WITHDRAWING ${shareBalance.toString()} SHARES`);
  tx = await Vault.withdraw(shareBalance);
  await tx.wait();
  console.log("------ WITHDRAWN");

  console.log("------ [USDC]:", (await USDC.balanceOf(user)).toString());
  console.log("------ [shares]:", (await Vault.balanceOf(user)).toString());
  console.log(
    "------ [USDC.balanceOf(strategy)]:",
    (await USDC.balanceOf(await Vault.strategy())).toString()
  );
  console.log(
    `[vault.totalSupply()] : ${(await Vault.totalSupply()).toString()}`
  );
  console.log("[TEST Vault END]");
}

module.exports = { testVault };
