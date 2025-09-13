// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ManagerActions.sol";
import {ISlashTokenDrawCaller, ISlashTokenDrawPythCaller} from "../handshake-registry-types/ISlashTokenDraw.sol";
contract CallHandler is ManagerActions {
    constructor(){}

    /**
        @notice External view functions that returns the requestId for a given drawId_
        @param drawId_ The draw's id to check

        @dev Checks if the drawId_ exists then checks if its a pyth or chainlink draw and proceeds to get the requestId
    **/
    function getRequestIdForDrawId(bytes32 drawId_) external view returns(uint256) {
        address drawAddress = drawIdToContract[drawId_];
        if(_checkPythAddresses(drawAddress)) {
            return uint256(ISlashTokenDrawPythCaller(drawAddress).getRequestIdForDrawId(drawId_));
        }else if(_checkChainlinkAddresses(drawAddress)){
            return ISlashTokenDrawCaller(drawAddress).getRequestIdForDrawId(drawId_);
        }else {
            return 0;
        }
    }

    /**
        @notice External view functions that returns the draw's status for a given drawId_
        @param drawId_ The draw's id to check

        @dev Checks if the drawId_ exists then checks if its a pyth or chainlink draw and proceeds to get the current status
    **/
    function getDrawStatus(bytes32 drawId_) external view returns(uint256) {
        address drawAddress = drawIdToContract[drawId_];
        if(_checkPythAddresses(drawAddress)) {
            return ISlashTokenDrawPythCaller(drawAddress).getDrawStatus(drawId_);
        }else if(_checkChainlinkAddresses(drawAddress)){
            return ISlashTokenDrawCaller(drawAddress).getDrawStatus(drawId_);
        }else {
            return 0;
        }
    }

    /**
        @notice External view functions that returns the response of the VRF/Entropy for a given drawId_
        @param drawId_ The draw's id to check

        @dev Checks if the drawId_ exists then checks if its a pyth or chainlink draw and proceeds to get the response of the corresponding provider
    **/
    function getRequestResponse(bytes32 drawId_) external view returns(uint256) {
        address drawAddress = drawIdToContract[drawId_];
        if(_checkPythAddresses(drawAddress)) {
            return ISlashTokenDrawPythCaller(drawAddress).getRequestResponse(drawId_);
        }else if(_checkChainlinkAddresses(drawAddress)){
            return ISlashTokenDrawCaller(drawAddress).getRequestResponse(drawId_);
        }else {
            return 0;
        }
    }

    /**
        @notice External view functions that returns the Entropy's uri and sequence number for a given drawId_
        @param drawId_ The draw's id to check

        @dev Checks if the drawId_ is a pyth draw and proceeds to get the provider's uri and draw's sequence number
    **/
    function getProviderInfoAndSequenceNumber(bytes32 drawId_) external view returns (bytes memory, uint64) {
        address drawAddress = drawIdToContract[drawId_];
        if(_checkPythAddresses(drawAddress)) {
            return ISlashTokenDrawPythCaller(drawAddress).getProviderInfoAndSequenceNumber(drawId_);
        }else {
            return ('', 0);
        }
    }

    /**
        @notice External view functions that returns the block that the distribution happened
        @param drawId_ The draw's id to check

        @dev Checks if the drawId_ exists then checks if its a pyth or chainlink draw and proceeds to get the block that the distribution happened
    **/
    function getDistributionBlock(bytes32 drawId_) external view returns(uint256) {
        address drawAddress = drawIdToContract[drawId_];
        if(_checkPythAddresses(drawAddress)) {
            return ISlashTokenDrawPythCaller(drawAddress).getDistributionBlock(drawId_);
        }else if(_checkChainlinkAddresses(drawAddress)){
            return ISlashTokenDrawCaller(drawAddress).getDistributionBlock(drawId_);
        }else {
            return 0;
        }
    }

     /**
        @notice External view functions that returns the user's drawId's and corresponding provider
        @param user The user's address
    **/
    function getUserDrawIds(address user) external view returns(bytes32[] memory drawIds, uint256[] memory network) {
        drawIds = userToDrawIds[user];
        network = new uint256[](drawIds.length);
        for(uint256 i=0; i<drawIds.length; i++){
            address drawAddress = drawIdToContract[drawIds[i]];
            network[i] = _checkChainlinkAddresses(drawAddress) ? 0 : 1;
        }
    }
}
