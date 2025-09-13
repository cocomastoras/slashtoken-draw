// SPDX-License-Identifier: UNLICENSED

import "../handshake-draw-libs/VRFConfig.sol";
import "../handshake-draw-libs/TokenTransferer.sol";
import {ManagerActions} from "../handshake-draw-libs/ManagerActions.sol";

pragma solidity 0.8.24;

/// @author 0xCocomastoras
/// @custom:version 1.0
/// @title SlashTokenDrawChainlinkV1
/// @notice SlashTokenDrawChainlinkV1 is a simple, yet powerful tool to airdrop tokens/NFTs or native currency to lottery winners using merkle trees and chainlink vrf.


contract SlashTokenDrawChainlinkTransientV1 is ManagerActions, VRFConfig, TokenTransferer {
    constructor(address vrfCoordinator, address registry_)ManagerActions(registry_)VRFConfig(vrfCoordinator){}

     /**
        @notice ERC-20 token draw with equal amount to all winners
        @param drawId_ The draw's id
        @param operator The draw's creator
        @param erc20Token The address of the token to airdrop
        @param rootHash The root of the merkle tree
        @param numOfWinners The number of total winners
        @param numOfParticipants The number of total participants
        @param winningAmountPerUser The amount each winner gonna get

        @dev Initialises a new erc20 draw using Chainlink's VRF

        Requirements:
        - Caller must be the registry contract
    **/
    function createNewErc20Draw(bytes32 drawId_, address operator, address erc20Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser) external {
        require(msg.sender == registry, 'NVS');
        drawIdToMaxLen[drawId_] = numOfParticipants;
        drawIdToRootHash[drawId_] = rootHash;
        drawIdToCreator[drawId_] = operator;
        drawIdToToken[drawId_] = erc20Token;
        drawIdToTotalWinners[drawId_] = numOfWinners;
        drawIdToWinningAmount[drawId_] = winningAmountPerUser;
        drawIdToDrawType[drawId_] = drawType.ERC20;
        emit DrawInitiated(drawId_);
        _requestRandomWords(drawId_);
    }

    /**
        @notice Native draw with equal amount to all winners
        @param drawId_ The draw's id
        @param operator The draw's creator
        @param rootHash The root of the merkle tree
        @param numOfWinners The number of total winners
        @param numOfParticipants The number of total participants
        @param winningAmountPerUser The amount each winner gonna get

        @dev Initialises a new native draw using Chainlink's VRF

       Requirements:
        - Caller must be the registry contract
    **/
    function createNewNativeDraw(bytes32 drawId_, address operator, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser) external{
        require(msg.sender == registry, 'NVS');
        drawIdToMaxLen[drawId_] = numOfParticipants;
        drawIdToRootHash[drawId_] = rootHash;
        drawIdToCreator[drawId_] = operator;
        drawIdToTotalWinners[drawId_] = numOfWinners;
        drawIdToWinningAmount[drawId_] = winningAmountPerUser;
        drawIdToDrawType[drawId_] = drawType.NATIVE;
        emit DrawInitiated(drawId_);
        _requestRandomWords(drawId_);
    }

    /**
        @notice ERC-721 token draw with equal amount to all winners
        @param drawId_ The draw's id
        @param operator The draw's creator
        @param erc721Token The address of the token to airdrop
        @param rootHash The root of the merkle tree
        @param numOfWinners The number of total winners
        @param numOfParticipants The number of total participants
        @param erc721IdsHash The keccak256(abi.encodePacked(tokenIds)) hash

        @dev Initialises a new erc721 draw using Chainlink's VRF

        Requirements:
        - Caller must be the registry contract
    **/
    function createNewErc721Draw(bytes32 drawId_, address operator, address erc721Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, bytes32 erc721IdsHash) external payable {
        require(msg.sender == registry, 'NVS');
        drawIdToMaxLen[drawId_] = numOfParticipants;
        drawIdToRootHash[drawId_] = rootHash;
        drawIdToCreator[drawId_] = operator;
        drawIdToToken[drawId_] = erc721Token;
        drawIdToTotalWinners[drawId_] = numOfWinners;
        drawIdToDrawType[drawId_] = drawType.ERC721;
        drawIdToErc721Ids[drawId_] = erc721IdsHash;
        emit DrawInitiated(drawId_);
        _requestRandomWords(drawId_);
    }

    /**
        @notice ERC-20 token draw distribution
        @param drawId_ The draw's id
        @param proof The Merkle tree proofs
        @param winnerAddresses List of winner addresses must be on the same order as produced by the Merkle proofs
        @param winnerIds List of winner ids must be on the same order as produced by the Merkle proofs
        @param flags Mercle tree flags for verification


        @dev Elects winners and distributes the prizes

        Requirements:
        - Caller must be the creator
        - Draw must not be distributed
        - Type of the draw must be erc20
        - Winner addresses length must match num of winners and winner ids length
        - Proofs must be valid
        - There must be a vrf response
        - Winner ids must match the winner ids produced by the election
    **/
    function distributeErc20Prizes(bytes32 drawId_, bytes32[] memory proof, address[] memory winnerAddresses, uint256[] memory winnerIds, bool[] memory flags) external {
        require(msg.sender == drawIdToCreator[drawId_], 'NVS');
        require(drawIdToDistributed[drawId_] == 0, 'AD');
        require(drawIdToDrawType[drawId_] == drawType.ERC20, 'NVTY');
        emit DrawCompleted(drawId_);
        drawIdToDistributed[drawId_] = block.number;
        uint256 requestId = drawIdToRequestId[drawId_];
        _electWinnersForDrawId(drawId_, requestId);
        require(winnerAddresses.length == drawIdToTotalWinners[drawId_] && winnerAddresses.length == winnerIds.length, 'NVL');
        address token = drawIdToToken[drawId_];
        _verify(drawId_, proof, winnerAddresses, winnerIds, flags);
        _cacheAndPerformMultiERC20TransferCustom(token, winnerAddresses, winnerIds, drawIdToWinningAmount[drawId_], drawId_);
    }

    /**
        @notice Native token draw distribution
        @param drawId_ The draw's id
        @param proof The Merkle tree proofs
        @param winnerAddresses List of winner addresses must be on the same order as produced by the Merkle proofs
        @param winnerIds List of winner ids must be on the same order as produced by the Merkle proofs
        @param flags Mercle tree flags for verification


        @dev Elects winners and distributes the prizes

        Requirements:
        - Caller must be the creator
        - Draw must not be distributed
        - Type of the draw must be Native
        - Winner addresses length must match num of winners and winner ids length
        - msg.value must equal numOfWinners*winningAmountPerUser
        - Proofs must be valid
        - There must be a vrf response
        - Winner ids must match the winner ids produced by the election
    **/
    function distributeNativePrizes(bytes32 drawId_, bytes32[] memory proof, address[] memory winnerAddresses, uint256[] memory winnerIds, bool[] memory flags) external payable {
        require(msg.sender == drawIdToCreator[drawId_], 'NVS');
        require(drawIdToDistributed[drawId_] == 0, 'AD');
        require(drawIdToDrawType[drawId_] == drawType.NATIVE, 'NVTY');
        emit DrawCompleted(drawId_);
        drawIdToDistributed[drawId_] = block.number;
        uint256 requestId = drawIdToRequestId[drawId_];
        _electWinnersForDrawId(drawId_, requestId);
        require(winnerAddresses.length == drawIdToTotalWinners[drawId_] && winnerAddresses.length == winnerIds.length, 'NVL');
        uint256 winningValue = drawIdToWinningAmount[drawId_];
        require(winningValue * winnerAddresses.length == msg.value, 'NVV');
        _verify(drawId_, proof, winnerAddresses, winnerIds, flags);
        _performNativeCustom(winnerAddresses, winnerIds, winningValue, drawId_);
    }

    /**
        @notice Native token draw distribution
        @param drawId_ The draw's id
        @param proof The Merkle tree proofs
        @param winnerAddresses List of winner addresses must be on the same order as produced by the Merkle proofs
        @param winnerIds List of winner ids must be on the same order as produced by the Merkle proofs
        @param flags Mercle tree flags for verification
        @param erc721Ids Token Ids

        @dev Elects winners and distributes the prizes

        Requirements:
        - Caller must be the creator
        - Draw must not be distributed
        - Type of the draw must be ERC721
        - Hash of the tokenIds must equals the hash commited on creation
        - Winner addresses length must match num of winners, winner ids length
        - Proofs must be valid
        - There must be a vrf response
        - Winner ids must match the winner ids produced by the election
    **/
    function distributeErc721Prizes(bytes32 drawId_, bytes32[] memory proof, address[] memory winnerAddresses, uint256[] memory winnerIds, bool[] memory flags, uint256[] memory erc721Ids) external {
        require(msg.sender == drawIdToCreator[drawId_], 'NVS');
        require(drawIdToDistributed[drawId_] == 0, 'AD');
        require(drawIdToDrawType[drawId_] == drawType.ERC721, 'NVTY');
        require(keccak256(abi.encodePacked(erc721Ids)) == drawIdToErc721Ids[drawId_], 'NVT');
        emit DrawCompleted(drawId_);
        drawIdToDistributed[drawId_] = block.number;
        uint256 requestId = drawIdToRequestId[drawId_];
        _electWinnersForDrawId(drawId_, requestId);
        require(winnerAddresses.length == drawIdToTotalWinners[drawId_] && winnerAddresses.length == winnerIds.length, 'NVL');
        address token = drawIdToToken[drawId_];
        _verify(drawId_, proof, winnerAddresses, winnerIds, flags);
        _performMultiERC721Transfer(token, winnerAddresses, winnerIds, erc721Ids, drawId_);
    }
}
