// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "../handshake-draw-types/VRFEvents.sol";
import "./DrawConfig.sol";
import "../handshake-draw-types/DrawEvents.sol";
import "hardhat/console.sol";

contract VRFConfig is VRFConsumerBaseV2, VRFEvents, DrawConfig, DrawEvents {
    /// @dev mapping of request id to request response
    mapping(uint256 => Requests) internal requestIdToRequest;
    /// @dev mapping of draw id to request id
    mapping(bytes32 => uint256) internal drawIdToRequestId;
    /// @dev mapping of request id to draw id
    mapping(uint256 => bytes32) internal requestIdToDrawId;

    /// @dev VRF's configuration
    VRFCoordinatorV2Interface immutable COORDINATOR;
    bytes32 constant S_KEYHASH = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
    uint32 constant CALLBACK_GAS_LIMIT = 100000;
    uint16 constant REQUEST_CONFIRMATIONS = 3;
    uint64 constant S_SUBSCRIPTIONID = 1;
    uint32 constant NUM_OF_WORDS = 1;

    struct Requests {
        bool exists;
        uint256 response;
        bool fulfilled;
    }

    constructor(address vrfCoordinator)VRFConsumerBaseV2(vrfCoordinator){
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        // revert if not valid reuqestId
        require(!requestIdToRequest[_requestId].fulfilled && requestIdToRequest[_requestId].exists);
        requestIdToRequest[_requestId].fulfilled = true;
        requestIdToRequest[_requestId].response = _randomWords[0];
        bytes32 drawId_ = requestIdToDrawId[_requestId];
        emit RequestFulfilled(drawId_ ,_requestId, _randomWords[0]);
    }

     /**
        @notice Inner function that asks for a vrf
    */
    function _requestRandomWords(bytes32 drawId_) internal returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            S_KEYHASH,
            S_SUBSCRIPTIONID,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_OF_WORDS
        );
        drawIdToRequestId[drawId_] = requestId;
        requestIdToDrawId[requestId] = drawId_;
        requestIdToRequest[requestId].exists = true;
        emit RequestSent(drawId_, requestId, NUM_OF_WORDS);
        return requestId;
    }

    /**
        @notice Inner function that elects winners
        @param drawId_, The draw's id
        @param requestId, The vrf's request id
    **/
     function _electWinnersForDrawId(bytes32 drawId_, uint256 requestId) internal {
         require(requestIdToRequest[requestId].exists && requestIdToRequest[requestId].fulfilled, 'NVR');
         uint256 vrfResponse = requestIdToRequest[requestId].response;
         uint totalWinners = drawIdToTotalWinners[drawId_];
         uint totalParticipants = drawIdToMaxLen[drawId_];
         bytes32 innerIdHash;
         bytes32 drawIdToWinnerPositionHash;
         assembly {
            mstore(0, drawId_)
            mstore(0x20, 0) // innerIdSlot fot transient safe space 0
            innerIdHash := keccak256(0, 0x40)
            mstore(0x20, 1) //  drawIdToWinnerPosition slot for transient safe space 1
            drawIdToWinnerPositionHash := keccak256(0, 0x40)
         }
         for (uint i = 0; i<totalWinners;) {
            assembly {
                let proposedId := add(mod(vrfResponse, totalParticipants), 1)
                mstore(0, proposedId)
                mstore(0x20, innerIdHash)
                let possibleId := tload(keccak256(0, 0x40))
                if eq(possibleId, 0) {
                    mstore(0x20, drawIdToWinnerPositionHash)
                    tstore(keccak256(0, 0x40), add(i, 1)) // store drawIdToWinnerPosition
                    log3(0, 0x20, 0x4a3cc1d41a78df84ae08a65deed3d205e3ab998d58c4b80d1b21f836cee796b4, drawId_, add(i, 1))
                }
                if gt(possibleId, 0) {
                    mstore(0, possibleId)
                    mstore(0x20, innerIdHash)
                    for {} gt(tload(keccak256(0, 0x40)), 0) {} {
                        possibleId := tload(keccak256(0, 0x40))
                        mstore(0, possibleId)
                    }
                    mstore(0x20, drawIdToWinnerPositionHash)
                    tstore(keccak256(0, 0x40), add(i, 1))
                    log3(0, 0x20, 0x4a3cc1d41a78df84ae08a65deed3d205e3ab998d58c4b80d1b21f836cee796b4, drawId_, add(i, 1))
                }
                mstore(0, proposedId)
                mstore(0x20, innerIdHash)
                tstore(keccak256(0, 0x40), totalParticipants)
            }
            unchecked {
                ++i;
                --totalParticipants;
            }
        }
    }

    /**
        @notice Get request id for given draw id
        @param drawId_ The draws id
    **/
    function getRequestIdForDrawId(bytes32 drawId_) external view returns (uint256) {
        return drawIdToRequestId[drawId_];
    }

    /**
        @notice Get request response for given draw id
        @param drawId_ The draws id
    **/
    function getRequestResponse(bytes32 drawId_) external view returns (uint256 rsp){
        rsp = requestIdToRequest[drawIdToRequestId[drawId_]].response;
    }

    /**
        @notice Get draw state for given draw id
        @param drawId_ The draws id
        @dev Statuses:
            -   0: drawId_ doesnt exist
            -   1: Vrf has not yet responded
            -   2: Draw has not yer distributed
            -   3: Draw completed
    **/
    function getDrawStatus(bytes32 drawId_) external view returns (uint256) {
        if (drawIdToTotalWinners[drawId_] == 0) {
            return 0;
        }else{
            uint256 requestId = drawIdToRequestId[drawId_];
            uint256 vrfResponse = requestIdToRequest[requestId].response;
            if(vrfResponse == 0) {
                return 1;
            }else{
                if(drawIdToDistributed[drawId_] != 0){
                    return 3;
                } else {
                    return 2;
                }
            }
        }
    }
}
