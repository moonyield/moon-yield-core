const { Contract } = require("ethers");

const {
  utils: { deployContract },
} = require("@axelar-network/axelar-local-dev");

const { ABIs } = require("./abi");

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
    ConverterContract.address,
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
  chain.mUSDC = new Contract(
    "0x744b1756e7651c6D57f5311767EAFE5E931D615b",
    ABIs.ERC20.abi,
    wallet
  );

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
  console.log("Complete.");
}

module.exports = { deployMoonbeam, deployRemoteChains };
