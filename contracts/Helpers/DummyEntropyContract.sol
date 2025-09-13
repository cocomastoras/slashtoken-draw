// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

contract DummyEntropyContract is IEntropy {
    constructor() {}
    uint64 internal seqNumber = 1;
    mapping(uint64 => bytes32) internal seqNumberToUserRandomNumber;

    function register(
        uint128,
        bytes32,
        bytes calldata,
        uint64,
        bytes calldata
    ) external {}

    function withdraw(uint128 amount) external {}

    function request(
        address,
        bytes32,
        bool
    ) external payable returns (uint64 assignedSequenceNumber) {
        assignedSequenceNumber = seqNumber;
        seqNumber++;
    }

    function requestWithCallback(
        address provider,
        bytes32 userRandomNumber
    ) external payable returns (uint64 assignedSequenceNumber) {
        assignedSequenceNumber = seqNumber;
        seqNumberToUserRandomNumber[seqNumber] = userRandomNumber;
        seqNumber++;
    }

     function _entropyCallback(
        uint64 sequence,
        address provider,
        bytes32 randomNumber,
        address contract_
    ) external {
        IEntropyConsumer(contract_)._entropyCallback(sequence, provider, randomNumber);
    }

    function reveal(
        address,
        uint64 sequenceNumber,
        bytes32 userRandomness,
        bytes32 providerRevelation
    ) external pure returns (bytes32 randomNumber) {
        randomNumber = keccak256(abi.encodePacked(sequenceNumber, userRandomness, providerRevelation));
    }

    function revealWithCallback(
        address provider,
        uint64 sequenceNumber,
        bytes32 userRandomNumber,
        bytes32 providerRevelation
    ) external {

    }

    function setProviderFee(uint128 newFeeInWei) external {

    }

    function setProviderUri(bytes calldata newUri) external {

    }

     function getProviderInfo(
        address provider
    ) external view returns (EntropyStructs.ProviderInfo memory info){}

    function getDefaultProvider() external view returns (address provider){}

    function getRequest(
        address provider,
        uint64 sequenceNumber
    ) external view returns (EntropyStructs.Request memory req){}

    function getFee(address) external pure returns (uint128 feeAmount){
        feeAmount = 1000;
    }

    function getAccruedPythFees()
        external
        view
        returns (uint128 accruedPythFeesInWei){}

    function constructUserCommitment(
        bytes32 userRandomness
    ) external pure returns (bytes32 userCommitment){
        userCommitment = keccak256(abi.encode(userRandomness));
    }

    function combineRandomValues(
        bytes32 userRandomness,
        bytes32 providerRandomness,
        bytes32 blockHash
    ) external pure returns (bytes32 combinedRandomness){}
}
