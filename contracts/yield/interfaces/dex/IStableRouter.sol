// SPDX-License-Identifier: MIT
import {ISwap} from "./ISwap.sol";

pragma solidity >=0.6.0 <0.9.0;

interface IStableRouter {
    function swapToBase(
        ISwap pool,
        ISwap basePool,
        uint8 tokenIndexFrom,
        uint8 tokenIndexTo,
        uint256 dx,
        uint256 minDy,
        uint256 deadline
    ) external returns (uint256);

    function swapFromBase(
        ISwap pool,
        ISwap basePool,
        uint8 tokenIndexFrom,
        uint8 tokenIndexTo,
        uint256 dx,
        uint256 minDy,
        uint256 deadline
    ) external returns (uint256);
}
