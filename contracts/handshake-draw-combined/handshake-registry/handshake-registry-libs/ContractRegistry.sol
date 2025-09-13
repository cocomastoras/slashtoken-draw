// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract ContractRegistry {
    /// @dev the two valid types of randomness provider
    enum validProviders{CHAINLINK, PYTH}
    /// @dev mapping of drawId_ to draw provider address (chainlink, pyth)
    mapping(bytes32 => address) internal drawIdToContract;
    /// @dev mapping of provider type to active provider address (chainlink, pyth), address(0) if there is no active
    mapping(validProviders => address) internal providerToAddress;
    /// @dev mapping of caller's address to caller's drawIds
    mapping(address => bytes32[]) internal userToDrawIds;
}
