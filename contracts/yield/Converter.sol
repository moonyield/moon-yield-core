//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

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
    }
    Tokens public tokens;

    struct Pools {
        ISwap axlUSDC4pool;
        ISwap base4pool;
    }
    Pools public pools;

    constructor() {
        routers.Stable = IStableRouter(
            address(0xB0Dfd6f3fdDb219E60fCDc1EA3D04B22f2FFa9Cc)
        );
        routers.V2 = IV2Router(
            address(0x70085a09D30D6f8C4ecF6eE10120d1847383BB57)
        );

        tokens.axlUSDC = ERC20(
            address(0xCa01a1D0993565291051daFF390892518ACfAD3A)
        );
        tokens.USDC = ERC20(
            address(0x931715FEE2d06333043d11F658C8CE934aC61D0c)
        );
        tokens.WELL = ERC20(
            address(0x511aB53F793683763E5a8829738301368a2411E3)
        );

        pools.axlUSDC4pool = ISwap(
            address(0xA1ffDc79f998E7fa91bA3A6F098b84c9275B0483)
        );
        pools.base4pool = ISwap(
            address(0xB1BC9f56103175193519Ae1540A0A4572b1566F6)
        );
    }

    function axlUSDCtoWormholeUSDC(uint256 amount)
        external
        returns (uint256 amountOut)
    {
        amountOut = routers.Stable.swapToBase(
            pools.axlUSDC4pool,
            pools.base4pool,
            0,
            0,
            amount,
            1,
            1
        );
    }

    function WormholeUSDCtoAxlUSDC(uint256 amount)
        external
        returns (uint256 amountOut)
    {
        amountOut = routers.Stable.swapFromBase(
            pools.axlUSDC4pool,
            pools.base4pool,
            0,
            0,
            amount,
            1,
            1
        );
    }
}
