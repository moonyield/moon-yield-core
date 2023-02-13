//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";

import {IStrategy} from "./interfaces/IStrategy.sol";

contract Vault is ERC20, Ownable {
    IStrategy public strategy;

    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {}

    function setStrategy(IStrategy _strategy) external onlyOwner {
        strategy = _strategy;
    }

    function want() public view returns (ERC20) {
        return ERC20(address(strategy.want()));
    }

    function balance() public view returns (uint256) {
        return want().balanceOf(address(this)) + strategy.balanceOf();
    }

    function available() public view returns (uint256) {
        return want().balanceOf(address(this));
    }

    function getPricePerFullShare() public view returns (uint256) {
        return totalSupply() == 0 ? 1e18 : (balance() * 1e18) / totalSupply();
    }

    function depositFor(uint256 amount, address holder) external {
        deposit(amount, holder);
    }

    function deposit(uint256 _amount, address holder) public {
        strategy.beforeDeposit();

        uint256 _pool = balance();
        want().transferFrom(msg.sender, address(this), _amount);
        earn();
        uint256 _after = balance();
        _amount = _after - _pool;
        uint256 shares = 0;

        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply()) / _pool;
        }

        _mint(holder, shares);
    }

    function earn() public {
        uint256 _bal = available();
        want().transfer(address(strategy), _bal);
        strategy.deposit();
    }

    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    function withdraw(uint256 _shares) public {
        uint256 r = (balance() * _shares) / totalSupply();
        _burn(msg.sender, _shares);

        uint256 b = want().balanceOf(address(this));
        if (b < r) {
            uint256 _withdraw = r - b;
            strategy.withdraw(_withdraw);
            uint256 _after = want().balanceOf(address(this));
            uint256 _diff = _after - b;
            if (_diff < _withdraw) {
                r = b + _diff;
            }
        }

        want().transfer(msg.sender, r);
    }
}
