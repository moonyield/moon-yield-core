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
    ICToken public mToken;
    IComptroller comptroller;
    Converter converter;
    ERC20 WELL;

    uint256 balanceOfPool;

    receive() external payable {}

    constructor(
        ERC20 _want,
        Vault _vault,
        Converter _converter,
        ICToken _mToken,
        IComptroller _troller,
        ERC20 _WELL
    ) {
        want = _want;
        vault = _vault;
        mToken = _mToken;
        comptroller = _troller;
        converter = _converter;
        WELL = _WELL;
    }

    function beforeDeposit() external {
        require(msg.sender == address(vault), "!vault");
        _harvest();
    }

    function deposit() public {
        uint256 wantBal = balanceOfWant();
        want.approve(address(mToken), wantBal);
        if (wantBal > 0) {
            mToken.mint(wantBal);
            updateBalance();
        }
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == address(vault));

        mToken.redeemUnderlying(_amount);
        updateBalance();

        want.transfer(address(vault), _amount);
    }

    function balanceOfWant() public view returns (uint256) {
        return want.balanceOf(address(this)) + balanceOfPool;
    }

    function updateBalance() public {
        balanceOfPool = mToken.balanceOfUnderlying(address(this));
    }

    function balanceOf() public view returns (uint256) {
        return balanceOfWant();
    }

    function harvest() external {
        _harvest();
    }

    function _harvest() internal {
        comptroller.claimReward(0, payable(address(this)));
        comptroller.claimReward(1, payable(address(this)));

        if (WELL.balanceOf(address(this)) > (1 ether / 10)) {
            _convertWELL();
        }
        if (address(this).balance > 0) {
            _convertGLMR();
        }

        deposit();
    }

    function _convertGLMR() internal {
        uint256 glmrBal = address(this).balance;
        converter.GLMRtoWormholeUSDC{value: glmrBal}(glmrBal);
    }

    function _convertWELL() internal {
        uint256 wellBal = WELL.balanceOf(address(this));
        WELL.approve(address(converter), wellBal);
        converter.WELLToWormholeUSDC(wellBal);
    }
}
