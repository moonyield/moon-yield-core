//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";

import {AddressToString} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/StringAddressUtils.sol";

contract RemoteDispatch {
    using AddressToString for address;

    IAxelarGateway public immutable gateway;
    IAxelarGasService public immutable gasService;

    string public constant YieldHubChain = "Moonbeam";
    address public immutable YieldHubAddress;

    IERC20 public depositToken;
    string public depositSymbol;

    event Deposit(address indexed user, uint256 amount);

    error GasNotProvided();

    constructor(
        IAxelarGateway _gateway,
        IAxelarGasService _gasService,
        address _hub,
        string memory _depositSymbol
    ) {
        gateway = _gateway;
        gasService = _gasService;
        YieldHubAddress = _hub;

        depositToken = IERC20(gateway.tokenAddresses(_depositSymbol));
        depositSymbol = _depositSymbol;
    }

    function deposit(uint256 amount) external payable {
        depositToken.transferFrom(msg.sender, address(this), amount);
        depositToken.approve(address(gateway), amount);

        bytes memory payload = abi.encode(msg.sender);

        if (msg.value == 0) revert GasNotProvided();
        gasService.payNativeGasForContractCallWithToken{value: msg.value}(
            address(this),
            YieldHubChain,
            YieldHubAddress.toString(),
            payload,
            depositSymbol,
            amount,
            msg.sender
        );

        gateway.callContractWithToken(
            YieldHubChain,
            YieldHubAddress.toString(),
            payload,
            depositSymbol,
            amount
        );

        emit Deposit(msg.sender, amount);
    }
}
