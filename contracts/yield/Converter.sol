//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IWETH} from "./interfaces/IWETH.sol";
import {IV2Router} from "./interfaces/dex/IV2Router.sol";
import {IStableRouter} from "./interfaces/dex/IStableRouter.sol";
import {ISwap} from "./interfaces/dex/ISwap.sol";

contract Converter {
    struct Routers {
        IStableRouter Stable;
        IV2Router V2;
    }
    Routers public routers;

    struct Tokens {
        ERC20 axlUSDC;
        ERC20 USDC;
        ERC20 WELL;
        IWETH WGLMR;
    }
    Tokens public tokens;

    struct Pools {
        ISwap axlUSDC4pool;
        ISwap base4pool;
    }
    Pools public pools;

    constructor() {
        routers.Stable = IStableRouter(
            0xB0Dfd6f3fdDb219E60fCDc1EA3D04B22f2FFa9Cc
        );
        routers.V2 = IV2Router(0x70085a09D30D6f8C4ecF6eE10120d1847383BB57);

        tokens.axlUSDC = ERC20(0xCa01a1D0993565291051daFF390892518ACfAD3A);
        tokens.USDC = ERC20(0x931715FEE2d06333043d11F658C8CE934aC61D0c);
        tokens.WELL = ERC20(0x511aB53F793683763E5a8829738301368a2411E3);

        tokens.WGLMR = IWETH(0xAcc15dC74880C9944775448304B263D191c6077F);

        pools.axlUSDC4pool = ISwap(0xA1ffDc79f998E7fa91bA3A6F098b84c9275B0483);
        pools.base4pool = ISwap(0xB1BC9f56103175193519Ae1540A0A4572b1566F6);
    }

    function WELLToWormholeUSDC(uint256 amount)
        external
        returns (uint256 amountOut)
    {}

    function GLMRtoWormholeUSDC(uint256 amount)
        external
        payable
        returns (uint256 amountOut)
    {}

    function axlUSDCtoWormholeUSDC(uint256 amount)
        external
        returns (uint256 amountOut)
    {
        tokens.axlUSDC.transferFrom(msg.sender, address(this), amount);
        tokens.axlUSDC.approve(address(routers.Stable), amount);
        amountOut = routers.Stable.swapToBase(
            pools.axlUSDC4pool,
            pools.base4pool,
            0,
            0,
            amount,
            1,
            block.timestamp
        );

        tokens.USDC.transfer(msg.sender, amountOut);
    }

    function WormholeUSDCtoAxlUSDC(uint256 amount)
        external
        returns (uint256 amountOut)
    {
        tokens.USDC.transferFrom(msg.sender, address(this), amount);
        tokens.USDC.approve(address(routers.Stable), amount);
        amountOut = routers.Stable.swapFromBase(
            pools.axlUSDC4pool,
            pools.base4pool,
            0,
            0,
            amount,
            1,
            block.timestamp
        );

        tokens.axlUSDC.transfer(msg.sender, amountOut);
    }

    function _convertToken(
        ERC20 from,
        ERC20 to,
        uint256 amount,
        address[] memory path
    ) internal returns (uint256) {
        if (address(from) == address(0)) {
            tokens.WGLMR.deposit{value: amount}();

            if (address(to) == address(tokens.WGLMR)) {
                return amount;
            }

            return _swapTokensUniV2(ERC20(address(tokens.WGLMR)), amount, path);
        }

        return _swapTokensUniV2(from, amount, path);
    }

    function _swapTokensUniV2(
        ERC20 from,
        uint256 amount,
        address[] memory path
    ) internal returns (uint256 amountBought) {
        // Approve the solarRouter to spend the contract's `from` token.
        from.approve(address(routers.V2), amount);
        uint256 lastInPath = path.length - 1;
        // Swap the tokens through solarRouter
        amountBought = routers.V2.swapExactTokensForTokens(
            amount,
            1,
            path,
            address(this),
            block.timestamp
        )[lastInPath];
    }
}
