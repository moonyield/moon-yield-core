//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {Vault} from "../yield/Vault.sol";
import {Converter} from "../yield/Converter.sol";

import {AddressToString, StringToAddress} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/StringAddressUtils.sol";

error WrongSource();
error WrongToken();

contract CrossYieldHub is AxelarExecutable, Ownable {
    using StringToAddress for string;
    using AddressToString for address;

    IERC20 public depositToken;
    string public depositSymbol;

    Converter converter;
    Vault vault;
    IERC20 USDC;
    IERC20 axlUSDC;

    // could be handled better by hashing together the chain & contract address to avoid the nested mapping.
    mapping(string => mapping(address => bool)) public allowedSources;

    event Deposit(
        address indexed user,
        string indexed sourceChain,
        string indexed sourceAddress,
        uint256 amount
    );

    event Withdraw(
        address indexed user,
        string indexed targetChain,
        address indexed receiver,
        uint256 amount
    );

    constructor(
        IAxelarGateway _gateway,
        string memory _depositSymbol,
        Converter _converter,
        Vault _vault
    ) AxelarExecutable(address(_gateway)) {
        depositSymbol = _depositSymbol;
        converter = _converter;
        vault = _vault;

        USDC = IERC20(address(0x931715FEE2d06333043d11F658C8CE934aC61D0c));
        axlUSDC = IERC20(address(0xCa01a1D0993565291051daFF390892518ACfAD3A));
    }

    function allowSource(string memory chain, address sourceContract)
        public
        onlyOwner
    {
        allowedSources[chain][sourceContract] = true;
    }

    function revokeSource(string memory chain, address sourceContract)
        public
        onlyOwner
    {
        allowedSources[chain][sourceContract] = false;
    }

    function _executeWithToken(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload,
        string calldata tokenSymbol,
        uint256 amount
    ) internal override {
        if (!allowedSources[sourceChain][sourceAddress.toAddress()])
            revert WrongSource();

        if (
            keccak256(abi.encodePacked(tokenSymbol)) !=
            keccak256(abi.encodePacked(depositSymbol))
        ) revert WrongToken();

        address depositor = abi.decode(payload, (address));

        axlUSDC.approve(address(converter), amount);
        uint256 usdcReceived = converter.axlUSDCtoWormholeUSDC(amount);

        USDC.approve(address(vault), usdcReceived);
        vault.depositFor(usdcReceived, depositor);

        emit Deposit(depositor, sourceChain, sourceAddress, amount);
    }

    function exitPosition(string calldata targetChain, uint256 shares)
        external
    {
        // Exit the position and withdraw to any supported chains.
        uint256 before = USDC.balanceOf(address(this));

        vault.transferFrom(msg.sender, address(this), shares);
        vault.withdraw(shares);

        uint256 usdcBalance = USDC.balanceOf(address(this)) - before;
        USDC.approve(address(converter), usdcBalance);
        uint256 toSend = converter.WormholeUSDCtoAxlUSDC(usdcBalance);

        axlUSDC.approve(address(gateway), toSend);
        gateway.sendToken(
            targetChain,
            msg.sender.toString(),
            depositSymbol,
            toSend
        );

        emit Withdraw(msg.sender, targetChain, msg.sender, toSend);
    }
}
