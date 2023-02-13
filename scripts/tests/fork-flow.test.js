"use strict";

require("dotenv").config();

const {
  getDefaultProvider,
  Contract,
  constants: { AddressZero },
  Wallet,
  Signer,
} = require("ethers");

const {
  utils: { deployContract },
} = require("@axelar-network/axelar-local-dev");

const ABIs = {
  Vault: require("../../artifacts/contracts/yield/Vault.sol/Vault.json"),
  Strategy: require("../../artifacts/contracts/yield/Strategy.sol/Strategy.json"),
  Converter: require("../../artifacts/contracts/yield/Converter.sol/Converter.json"),
  CrossYieldHub: require("../../artifacts/contracts/cross-chain/CrossYieldHub.sol/CrossYieldHub.json"),
  RemoteDispatch: require("../../artifacts/contracts/cross-chain/RemoteDispatch.sol/RemoteDispatch.json"),
  Gateway: require("../../artifacts/@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol/IAxelarGateway.json"),
  ERC20: require("../../artifacts/@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol/IERC20.json"),
};

function sleep(ms) {
  return new Promise(() => {
    setTimeout(() => {
      resolve;
    }, ms);
  });
}

async function deployMoonbeam(chain, wallet) {
  console.log("Deploying on Moonbeam...");
  const ConverterContract = await deployContract(wallet, ABIs.Converter);

  const VaultContract = await deployContract(wallet, ABIs.Vault, [
    "MoonYield USDC",
    "moonUSDC",
  ]);
  const StrategyContract = await deployContract(wallet, ABIs.Strategy, [
    "0x931715FEE2d06333043d11F658C8CE934aC61D0c",
    VaultContract.address,
  ]);

  const setStratTx = await VaultContract.setStrategy(StrategyContract.address);
  await setStratTx.wait();

  const CrossYieldHubContract = await deployContract(
    wallet,
    ABIs.CrossYieldHub,
    [chain.gateway, "axlUSDC", ConverterContract.address, VaultContract.address]
  );

  const Gateway = new Contract(chain.gateway, ABIs.Gateway.abi, wallet);

  chain.contracts = {
    ConverterContract,
    VaultContract,
    StrategyContract,
    CrossYieldHubContract,
    Gateway,
  };
  const tokens = await ConverterContract.tokens();
  chain.axlUSDC = new Contract(tokens.axlUSDC, ABIs.ERC20.abi, wallet);
  chain.USDC = new Contract(tokens.USDC, ABIs.ERC20.abi, wallet);

  return CrossYieldHubContract.address;
}

async function deployRemoteChains(chain, wallet, HUB) {
  console.log(`Deploying on ${chain.name}...`);
  const RemoteDispatchContract = await deployContract(
    wallet,
    ABIs.RemoteDispatch,
    [chain.gateway, chain.gasReceiver, HUB, "axlUSDC"]
  );

  const Gateway = new Contract(chain.gateway, ABIs.Gateway.abi, wallet);

  chain.axlUSDC = new Contract(
    await Gateway.tokenAddresses("axlUSDC"),
    ABIs.ERC20.abi,
    wallet
  );

  chain.contracts = {
    RemoteDispatchContract,
    Gateway,
  };
}

async function main() {
  const chains = require("../../local.json");
  const private_key = process.env.EVM_PRIVATE_KEY;
  const wallet = new Wallet(private_key);

  const Moonbeam = chains.find((c) => c.name === "Moonbeam");
  const RemoteChains = chains.filter((c) => c.name !== "Moonbeam");

  const HUB = await deployMoonbeam(
    Moonbeam,
    wallet.connect(getDefaultProvider(Moonbeam.rpc))
  );
  console.log(`HUB deployed at ${HUB}`);

  const promises = [];
  for (const chain of RemoteChains) {
    const provider = getDefaultProvider(chain.rpc);
    promises.push(deployRemoteChains(chain, wallet.connect(provider), HUB));
  }
  await Promise.all(promises);
}

if (require.main === module) {
  main();
}
