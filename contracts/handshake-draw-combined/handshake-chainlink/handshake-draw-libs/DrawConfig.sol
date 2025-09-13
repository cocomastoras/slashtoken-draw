// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./MerkleProofVerifier.sol";

contract DrawConfig is MerkleProofVerifier {
    /// @dev draw Types
    enum drawType{ERC20, ERC721, NATIVE}
    /// @dev mapping from draw id to draw's total participants
    mapping(bytes32 => uint256) internal drawIdToMaxLen;
    /// @dev mapping from draw id to erc20/erc721 token address or address(0)
    mapping(bytes32 => address) internal drawIdToToken;
    /// @dev mapping from draw id to keccak256(abi.encodePacked(erc721TokenIds))
    mapping(bytes32 => bytes32) internal drawIdToErc721Ids;
    /// @dev mapping from draw id to draw type
    mapping(bytes32 => drawType) internal drawIdToDrawType;
    /// @dev mapping from draw id to amount per user for erc20/native
    mapping(bytes32 => uint256) internal drawIdToWinningAmount;
    /// @dev mapping from draw id to total winners
    mapping(bytes32 => uint256) internal drawIdToTotalWinners;
    /// @dev mapping from draw id to draw's creator
    mapping(bytes32 => address) internal drawIdToCreator;
    /// @dev mapping from draw id to winner id to position index
    mapping(bytes32 => mapping(uint256 => uint256)) internal drawIdToWinnerPosition;
    /// @dev mapping from draw id to userIdLast to userIdNew
    mapping(bytes32 => mapping(uint256 => uint256)) internal drawIdToInnerIdSwap;
    /// @dev mapping from draw id to distribution status
    mapping(bytes32 => uint256) internal drawIdToDistributed;

    /**
        @notice Get the distribution block of the given draw id or 0
        @param drawId_
    **/
    function getDistributionBlock(bytes32 drawId_) external view returns(uint256) {
        return drawIdToDistributed[drawId_];
    }
}