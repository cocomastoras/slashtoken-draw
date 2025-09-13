// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "../handshake-draw-types/VRFEvents.sol";
import "./DrawConfig.sol";
import "../handshake-draw-types/DrawEvents.sol";
import "hardhat/console.sol";

contract VRFConfig is VRFConsumerBaseV2Plus, VRFEvents, DrawConfig, DrawEvents {
    /// @dev mapping of request id to request response
    mapping(uint256 => Requests) internal requestIdToRequest;
    /// @dev mapping of draw id to request id
    mapping(bytes32 => uint256) internal drawIdToRequestId;
    /// @dev mapping of request id to draw id
    mapping(uint256 => bytes32) internal requestIdToDrawId;

    /// @dev VRF's configuration
    IVRFCoordinatorV2Plus immutable COORDINATOR;
    bytes32 constant S_KEYHASH = 0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899;
    uint32 constant CALLBACK_GAS_LIMIT = 100000;
    uint16 constant REQUEST_CONFIRMATIONS = 3;
    uint256 constant S_SUBSCRIPTIONID = 113873299710613086128442032174610348313561093373023160223251786299375295702404;
    uint32 constant NUM_OF_WORDS = 1;

    struct Requests {
        bool exists;
        uint256 response;
        bool fulfilled;
    }

    constructor(address vrfCoordinator)VRFConsumerBaseV2Plus(vrfCoordinator){
        COORDINATOR = IVRFCoordinatorV2Plus(vrfCoordinator);
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
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: S_KEYHASH,
                subId: S_SUBSCRIPTIONID,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords:NUM_OF_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
            })
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
        uint256[] memory drawWinners = new uint256[](totalWinners);
        for (uint i = 0; i<totalWinners;) {
            uint256 proposedId = (vrfResponse % totalParticipants) + 1;
            uint256 possibleId = drawIdToInnerIdSwap[drawId_][proposedId];
            if(possibleId == 0) {
                drawIdToWinnerPosition[drawId_][proposedId] = i+1;
                drawWinners[i] = proposedId;
                emit RoundWinner(drawId_, i+1, proposedId);
            }else {
                while(drawIdToInnerIdSwap[drawId_][possibleId] != 0){
                    possibleId = drawIdToInnerIdSwap[drawId_][possibleId];
                }
                drawIdToWinnerPosition[drawId_][possibleId] = i+1;
                drawWinners[i] = possibleId;
                emit RoundWinner(drawId_, i+1, possibleId);
            }
            drawIdToInnerIdSwap[drawId_][proposedId] = totalParticipants;
            unchecked {
                ++i;
                --totalParticipants;
            }
        }
        for(uint i = 0; i<totalWinners;){
            delete drawIdToInnerIdSwap[drawId_][drawWinners[i]];
            unchecked {
                ++i;
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
