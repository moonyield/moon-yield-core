module.exports = {
  ABIs: {
    Vault: require("../../../artifacts/contracts/yield/Vault.sol/Vault.json"),
    Strategy: require("../../../artifacts/contracts/yield/Strategy.sol/Strategy.json"),
    Converter: require("../../../artifacts/contracts/yield/Converter.sol/Converter.json"),
    CrossYieldHub: require("../../../artifacts/contracts/cross-chain/CrossYieldHub.sol/CrossYieldHub.json"),
    RemoteDispatch: require("../../../artifacts/contracts/cross-chain/RemoteDispatch.sol/RemoteDispatch.json"),
    Gateway: require("../../../artifacts/@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol/IAxelarGateway.json"),
    ERC20: require("../../../artifacts/@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol/IERC20.json"),
    StableRouter: require("../../../artifacts/contracts/yield/interfaces/dex/IStableRouter.sol/IStableRouter.json"),
  },
};
