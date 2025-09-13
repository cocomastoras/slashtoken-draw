// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface DrawEvents {
    event DrawInitiated(bytes32 indexed DrawId);
    event RoundWinner(bytes32 indexed DrawId, uint256 indexed Round, uint256 Id);
    event DrawCompleted(bytes32 indexed DrawId);
}
