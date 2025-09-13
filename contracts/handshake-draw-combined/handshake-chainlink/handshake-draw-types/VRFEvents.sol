// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface VRFEvents {
    event RequestSent(bytes32 indexed DrawId, uint256 indexed RequestId, uint256 NumOfWords);
    event RequestFulfilled(bytes32 indexed DrawId, uint256 indexed RequestId, uint256 Response);
}
