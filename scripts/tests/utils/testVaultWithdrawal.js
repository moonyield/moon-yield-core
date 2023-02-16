const { Contract, Wallet, getDefaultProvider } = require("ethers");
const { ABIs } = require("./abi");

require("dotenv").config();

async function main() {
  const chains = require("../../../local.json");
  const private_key = process.env.EVM_PRIVATE_KEY;
  const wallet = new Wallet(private_key);

  const user = wallet.address;

  const Moonbeam = chains.find((c) => c.name === "Moonbeam");
  const signer = wallet.connect(getDefaultProvider(Moonbeam.rpc));

  const Vault = new Contract(
    "0xe3fA983EF68ECF002476A1535dA553C569863630",
    ABIs.Vault.abi,
    signer
  );

  const Strategy = new Contract(
    "0xD9A6f2ae7290cA6042016e82b9d6C943A8B1594b",
    ABIs.Strategy.abi,
    signer
  );

  const USDC = new Contract(await Vault.want(), ABIs.ERC20.abi, signer);

  console.log((await Vault.getPricePerFullShare()).toString());
  console.log((await Strategy.balanceOfWant()).toString());
  console.log((await Vault.balanceOf(user)).toString());
  console.log((await Vault.balance()).toString());
  console.log((await USDC.balanceOf(Strategy.address)).toString());

  // let tx = await Strategy.withdraw(501245);
  // await tx.wait();
  // let tx = await Vault.withdrawAll();
  // await tx.wait();
}

main();
