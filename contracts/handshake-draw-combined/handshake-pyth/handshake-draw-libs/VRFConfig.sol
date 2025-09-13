// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "../hansdshake-draw-types/VRFEvents.sol";
import "./DrawConfig.sol";
import "../hansdshake-draw-types/DrawEvents.sol";

contract VRFConfig is VRFEvents, DrawConfig, DrawEvents {
    /// @dev mapping of draw id to request id
    mapping(bytes32 => uint64) drawIdToSequenceNumber;
    /// @dev mapping of draw id to vrf respinse
    mapping(bytes32 => uint256) drawIdToRandomNumber;

    /// @dev VRF's configuration
    IEntropy immutable entropy;
    address constant PROVIDER = 0x52DeaA1c84233F7bb8C8A45baeDE41091c616506;

    constructor(address entropy_address){
        entropy = IEntropy(entropy_address);
    }

    /**
        @notice Reveals secret number and elects winners
        @param drawId_ The draw's id
        @param userRandom The user's secret number
        @param providerRandom The provider's secret number

        Requirements:
        - Random number must not been revealed
        - Caller must be the creator
    **/
    function revealRandomWordsAndElectWinners(bytes32 drawId_, bytes32 userRandom, bytes32 providerRandom) external {
        require(drawIdToRandomNumber[drawId_] == 0, 'AE');
        require(drawIdToCreator[drawId_] == msg.sender, 'NVS');
        // revert if not valid reuqestId
        bytes32 randomNumber = entropy.reveal(
            PROVIDER,
            drawIdToSequenceNumber[drawId_],
            userRandom,
            providerRandom
        );
        uint256 wrappedNumber = uint256(randomNumber);
        drawIdToRandomNumber[drawId_] = wrappedNumber;
        emit RequestFulfilled(drawId_, drawIdToSequenceNumber[drawId_], wrappedNumber);
        _electWinnersForDrawId(drawId_, wrappedNumber);
    }

     /**
        @notice Inner function that asks for a vrf
    */
    function _requestRandomWords(bytes32 drawId_, bytes32 commitment, uint256 fee) internal returns (uint256 requestId) {
        uint64 sequenceNumber = entropy.request{value: fee}(PROVIDER, commitment, false);
        drawIdToSequenceNumber[drawId_] = sequenceNumber;
        emit RequestSent(drawId_, sequenceNumber);
        return requestId;
    }

    /**
        @notice Inner function that elects winners
        @param drawId_, The draw's id
        @param vrfResponse, The vrf's secret number
    **/
    function _electWinnersForDrawId(bytes32 drawId_, uint256 vrfResponse) internal {
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
        @notice Get sequence number for given draw id
        @param drawId_ The draws id
    **/
    function getRequestIdForDrawId(bytes32 drawId_) external view returns (uint64) {
        return drawIdToSequenceNumber[drawId_];
    }

    /**
        @notice Get request response for given draw id
        @param drawId_ The draws id
    **/
    function getRequestResponse(bytes32 drawId_) external view returns(uint256) {
        return drawIdToRandomNumber[drawId_];
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
        }else {
            uint256 vrfResponse = drawIdToRandomNumber[drawId_];
            if(vrfResponse == 0) {
                return 1;
            }else{
                if(drawIdToDistributed[drawId_] == 0){
                    return 2;
                } else {
                    return 3;
                }
            }
        }
    }

     /**
        @notice Get provider's uri
    **/
    function getProviderInfo() external view returns (bytes memory) {
        EntropyStructs.ProviderInfo memory providerInfo = entropy.getProviderInfo(PROVIDER);
        return providerInfo.uri;
    }

     /**
        @notice Get provider's uri and draw's sequence number
        @param drawId_ The draws i
    **/
    function getProviderInfoAndSequenceNumber(bytes32 drawId_) external view returns (bytes memory, uint64) {
        EntropyStructs.ProviderInfo memory providerInfo = entropy.getProviderInfo(PROVIDER);
        return (providerInfo.uri, drawIdToSequenceNumber[drawId_]);
    }
}
