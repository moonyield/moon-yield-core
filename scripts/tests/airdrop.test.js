"use strict";

require("dotenv").config();

const {
  getDefaultProvider,
  Contract,
  constants: { AddressZero },
  Wallet,
} = require("ethers");

const {
  utils: { deployContract },
} = require("@axelar-network/axelar-local-dev");

const Airdrop = require("../../artifacts/contracts/Airdrop.sol/Airdrop.json");
const Gateway = require("../../artifacts/@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol/IAxelarGateway.json");
const IERC20 = require("../../artifacts/@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol/IERC20.json");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function deploy(chain, wallet) {
  console.log(`Deploying Airdrop for ${chain.name}`);
  const contract = await deployContract(wallet, Airdrop, [
    chain.gateway,
    chain.gasReceiver,
  ]);
  chain.airdrop = contract.address;
  console.log(`Deployed Airdrop for ${chain.name} at ${chain.airdrop}`);
}

async function test(chains, wallet, options) {
  const { getGasPrice } = options;

  const source = chains.find((chain) => chain.name == "Avalanche");
  const destination = chains.find((chain) => chain.name == "Moonbeam");

  const amount = 1000 * 1e6; //  = 1000 USDC
  const accounts = [
    "0xb11193bEb431156e99319848399331e5DE98ec92",
    "0x87554eDf065c2d5711c90434234D3FaBD1409B45",
  ];

  for (const chain of [source, destination]) {
    const provider = getDefaultProvider(chain.rpc);
    chain.wallet = wallet.connect(provider);
    chain.contract = new Contract(chain.airdrop, Airdrop.abi, chain.wallet);
    chain.gateway = new Contract(chain.gateway, Gateway.abi, chain.wallet);
    const usdcAddress = await chain.gateway.tokenAddresses("aUSDC");
    chain.usdc = new Contract(usdcAddress, IERC20.abi, chain.wallet);
    console.log(
      `Deployer has ${
        (await chain.usdc.balanceOf(wallet.address)) / 1e6
      } aUSDC on ${chain.name}`
    );
  }

  async function logAccountBalances() {
    for (const account of accounts) {
      console.log(
        `${account} has ${
          (await destination.usdc.balanceOf(account)) / 1e6
        } aUSDC`
      );
    }
  }

  console.log("--- Initially ---");
  await logAccountBalances();

  const gasLimit = 3e6;
  const gasPrice = await getGasPrice(source, destination, AddressZero);

  const balance = BigInt(await destination.usdc.balanceOf(accounts[0]));

  const approveTx = await source.usdc.approve(source.contract.address, amount);
  await approveTx.wait();

  const sendTx = await source.contract.sendToMany(
    destination.name,
    destination.airdrop,
    accounts,
    "aUSDC",
    amount,
    {
      value: BigInt(Math.floor(gasLimit * gasPrice)),
    }
  );
  await sendTx.wait();

  while (BigInt(await destination.usdc.balanceOf(accounts[0])) === balance) {
    await sleep(2000);
  }

  console.log("--- After ---");
  await logAccountBalances();
}

async function main() {
  const chains = require("../../local.json");
  const private_key = process.env.EVM_PRIVATE_KEY;
  const wallet = new Wallet(private_key);

  const promises = [];
  for (const chain of chains) {
    const rpc = chain.rpc;
    const provider = getDefaultProvider(rpc);
    promises.push(deploy(chain, wallet.connect(provider)));
  }

  await Promise.all(promises);

  test(chains, wallet, {
    getGasPrice: (source, destination, tokenAddress) => 1,
  });
}

if (require.main === module) {
  main();
}
