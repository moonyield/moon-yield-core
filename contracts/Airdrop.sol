// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";

error GasNotProvided();

contract Airdrop is AxelarExecutable {
    IAxelarGasService public immutable gasReceiver;

    constructor(IAxelarGateway _gateway, IAxelarGasService _receiver)
        AxelarExecutable(address(_gateway))
    {
        gasReceiver = _receiver;
    }

    function sendToMany(
        string memory destinationChain,
        string memory destinationAddress,
        address[] calldata destinationReceivers,
        string memory symbol,
        uint256 amount
    ) external payable {
        IERC20 token = IERC20(gateway.tokenAddresses(symbol));
        token.transferFrom(msg.sender, address(this), amount);
        token.approve(address(gateway), amount);
        bytes memory payload = abi.encode(destinationReceivers);

        if (msg.value == 0) revert GasNotProvided();
        gasReceiver.payNativeGasForContractCallWithToken{value: msg.value}(
            address(this),
            destinationChain,
            destinationAddress,
            payload,
            symbol,
            amount,
            msg.sender
        );
        gateway.callContractWithToken(
            destinationChain,
            destinationAddress,
            payload,
            symbol,
            amount
        );
    }

    function _executeWithToken(
        string calldata,
        string calldata,
        bytes calldata payload,
        string calldata tokenSymbol,
        uint256 amount
    ) internal override {
        address[] memory recipients = abi.decode(payload, (address[]));
        IERC20 token = IERC20(gateway.tokenAddresses(tokenSymbol));

        uint256 amountPerReceiver = amount / recipients.length;
        for (uint256 i = 0; i < recipients.length; i++) {
            token.transfer(recipients[i], amountPerReceiver);
        }
    }
}
