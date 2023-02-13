// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Vault} from "./Vault.sol";

contract Strategy {
    ERC20 public want;
    Vault public vault;

    constructor(ERC20 _want, Vault _vault) {
        want = _want;
        vault = _vault;
    }

    function beforeDeposit() external {}

    function deposit() public {
        uint256 wantBal = availableWant();
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == address(vault));
        want.transfer(address(vault), _amount);
    }

    function availableWant() public view returns (uint256) {
        uint256 wantBal = want.balanceOf(address(this));
        return wantBal;
    }

    function balanceOf() public view returns (uint256) {
        return availableWant();
    }

    function balanceOfPool() public view returns (uint256) {
        return availableWant();
    }
}
