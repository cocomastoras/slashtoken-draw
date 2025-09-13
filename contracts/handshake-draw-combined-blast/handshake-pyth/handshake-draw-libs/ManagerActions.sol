// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IBlast} from "../hansdshake-draw-types/IBlast.sol";
import {IBlastPoints} from "../hansdshake-draw-types/IBlast.sol";

contract ManagerActions {
    /// @dev contracts owner
    address constant internal owner = 0xe2b45F0Bc95639773080c60D92dC5069f0461D04;
    /// @dev registry contract
    address internal registry;
    /// @dev gas Sink;
    address internal gasSink = 0x74126e09A710F21a35DA00021b98930E406DbD7f;
    address constant internal YIELD_CONTRACT = 0x4300000000000000000000000000000000000002;
    address constant internal POINTS_CONTRACT = 0x2536FE9ab3F511540F2f9e2eC2A805005C3Dd800;



    constructor(address registry_) {
        registry = registry_;
        IBlast(YIELD_CONTRACT).configureAutomaticYield();
        IBlast(YIELD_CONTRACT).configureClaimableGas();
        IBlastPoints(POINTS_CONTRACT).configurePointsOperator(owner);
    }

    function claimMaxGas() external {
        require(msg.sender == owner, 'NVS');
        IBlast(YIELD_CONTRACT).claimMaxGas(address(this), gasSink);
    }

    /**
        @notice Admin updates gas sink address
        @param gasSink_ The new gas sink address
    */
    function updateGasSink(address gasSink_) external {
        require(msg.sender == owner, 'NVS');
        gasSink = gasSink_;
    }
}
