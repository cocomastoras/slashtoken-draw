// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface VRFEvents {
    event RequestSent(bytes32 indexed DrawId, uint64 indexed RequestId);
    event RequestFulfilled(bytes32 indexed DrawId, uint64 indexed RequestId, uint256 Response);
}
