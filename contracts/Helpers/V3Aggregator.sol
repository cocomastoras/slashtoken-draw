// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract V3Aggregator {
    constructor(){}
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return(73786976294838216061, 7821306005191627, 1707381467, 1707381467, 73786976294838216061);
    }
}
