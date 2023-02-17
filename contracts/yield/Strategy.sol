// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Vault} from "./Vault.sol";
import {Converter} from "./Converter.sol";
import {IComptroller} from "./interfaces/lending/IComptroller.sol";
import {ICToken} from "./interfaces/lending/ICToken.sol";

contract Strategy {
    ERC20 public want;
    Vault public vault;
    Converter converter;

    receive() external payable {}

    constructor(
        ERC20 _want,
        Vault _vault,
        Converter _converter
    ) {
        want = _want;
        vault = _vault;
        converter = _converter;
    }

    function beforeDeposit() external {
        require(msg.sender == address(vault), "!vault");
    }

    function deposit() public {}

    function withdraw(uint256 _amount) external {
        require(msg.sender == address(vault));

        want.transfer(address(vault), _amount);
    }

    function balanceOfWant() public view returns (uint256) {
        return want.balanceOf(address(this));
    }

    function balanceOf() public view returns (uint256) {
        return balanceOfWant();
    }
}
