// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract ManagerActions{
    /// @dev contracts owner
    address immutable internal owner = msg.sender;
    /// @dev registry contract
    address internal registry;

    constructor(address registry_) {
        registry = registry_;
    }
}
