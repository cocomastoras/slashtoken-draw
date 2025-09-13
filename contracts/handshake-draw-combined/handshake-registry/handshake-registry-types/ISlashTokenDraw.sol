// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ISlashTokenDraw {
    function createNewErc20Draw(bytes32 drawId_, address operator, address erc20Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser) external;
    function createNewNativeDraw(bytes32 drawId_, address operator, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser) external;
    function createNewErc721Draw(bytes32 drawId_, address operator, address erc721Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, bytes32 erc721IdsHash) external;
}

interface ISlashTokenDrawPyth {
    function createNewErc20Draw(bytes32 drawId_, address operator, address erc20Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser, bytes32 commitment, uint256 fee) external payable;
    function createNewNativeDraw(bytes32 drawId_, address operator, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser, bytes32 commitment, uint256 fee) external payable;
    function createNewErc721Draw(bytes32 drawId_, address operator, address erc721Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, bytes32 erc721IdsHash, bytes32 commitment, uint256 fee) external payable;
}

interface ISlashTokenDrawCaller {
    function getDrawStatus(bytes32 drawId_) external view returns (uint256);
    function getRequestIdForDrawId(bytes32 drawId_) external view returns (uint256);
    function getRequestResponse(bytes32 drawId_) external view returns(uint256);
    function getDistributionBlock(bytes32 drawId_) external view returns(uint256);
}

interface ISlashTokenDrawPythCaller {
    function getDrawStatus(bytes32 drawId_) external view returns (uint256);
    function getRequestIdForDrawId(bytes32 drawId_) external view returns (uint64);
    function getRequestResponse(bytes32 drawId_) external view returns(uint256);
    function getProviderInfoAndSequenceNumber(bytes32 drawId_) external view returns (bytes memory, uint64);
    function getDistributionBlock(bytes32 drawId_) external view returns(uint256);
}
