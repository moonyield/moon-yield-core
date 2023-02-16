pragma solidity ^0.8.0;

interface IComptroller {
    function claimReward(uint8 rewardType, address payable holder) external;
}
