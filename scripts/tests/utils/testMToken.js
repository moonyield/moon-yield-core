const { Contract, Wallet, getDefaultProvider } = require("ethers");
const { ABIs } = require("./abi");

require("dotenv").config();

async function main() {
  const chains = require("../../../local.json");
  const private_key = process.env.EVM_PRIVATE_KEY;
  const wallet = new Wallet(private_key);

  const user = wallet.address;
  let tx;

  const Moonbeam = chains.find((c) => c.name === "Moonbeam");
  const signer = wallet.connect(getDefaultProvider(Moonbeam.rpc));

  const mUSDC = new Contract(
    "0x744b1756e7651c6D57f5311767EAFE5E931D615b",
    ABIs.MToken.abi,
    signer
  );
  const USDC = new Contract(
    "0x931715FEE2d06333043d11F658C8CE934aC61D0c",
    ABIs.ERC20.abi,
    signer
  );

  let usdcBal = await USDC.balanceOf(user);
  const usdcBalStart = usdcBal;
  let mUsdcBal = await mUSDC.balanceOf(user);
  console.log(`[USDC]: ${usdcBal.toString()}`);
  console.log(`[mUSDC]: ${mUsdcBal.toString()}`);
  console.log("--------");

  tx = await USDC.approve(mUSDC.address, usdcBal);
  await tx.wait();

  tx = await mUSDC.mint(usdcBal);
  await tx.wait();

  usdcBal = await USDC.balanceOf(user);
  mUsdcBal = await mUSDC.balanceOf(user);
  console.log(`[USDC]: ${usdcBal.toString()}`);
  console.log(`[mUSDC]: ${mUsdcBal.toString()}`);
  console.log("--------");
  tx = await mUSDC.redeemUnderlying(usdcBalStart);
  await tx.wait();
  usdcBal = await USDC.balanceOf(user);
  mUsdcBal = await mUSDC.balanceOf(user);
  console.log(`[USDC]: ${usdcBal.toString()}`);
  console.log(`[mUSDC]: ${mUsdcBal.toString()}`);
  console.log("--------");
}

main();
