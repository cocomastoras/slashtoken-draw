// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import {SubscriptionRegistry} from "../handshake-registry-libs/SubscriptionRegistry.sol";
import {ISlashTokenDraw, ISlashTokenDrawPyth} from "../handshake-registry-types/ISlashTokenDraw.sol";

/// @author 0xCocomastoras
/// @custom:version 1.0
/// @title SlashTokenDrawRegistry
/// @notice SlashTokenDrawRegistry is a simple, yet powerful tool to airdrop tokens/NFTs or native currency to lottery winners using merkle trees and chainlink/pyth's vrf.
contract SlashTokenDrawRegistry is SubscriptionRegistry {
    constructor(){}

    /**
        @notice ERC-20 token draw with equal amount to all winners
        @param drawId_ The draw's id
        @param erc20Token The address of the token to airdrop
        @param rootHash The root of the merkle tree
        @param numOfWinners The number of total winners
        @param numOfParticipants The number of total participants
        @param winningAmountPerUser The amount each winner gonna get

        @dev Initialises a new erc20 draw using Chainlink's VRF

        Requirements:
        - Contract must not be frozen
        - Caller must not be denylisted
        - Contract must be initialised
        - `drawId_` must not been used before
        - `numOfWinners` must be greater than 0 and less than 101 and equal or less than participants
        - `numOfParticipants` must be greater than 0 and less than 100001
        - There must be an active chainlink contract
        - The caller must provide a correct msg.value
    **/
    function createNewErc20DrawChainlink(bytes32 drawId_, address erc20Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser) external payable {
        require(frozen == 0, 'CF');
        require(denylist[msg.sender] == 0, 'UD');
        require(isInitialized != 0, 'NIY');
        require(numOfWinners != 0 && numOfWinners <= 100 && numOfWinners <= numOfParticipants, 'NVW');
        require(numOfParticipants != 0 && numOfParticipants <= 100000, 'NVP');
        require(drawIdToContract[drawId_] == address(0), 'DIU');
        address providerAdd =  providerToAddress[validProviders.CHAINLINK];
        require(providerAdd != address(0), "NVPR");
        drawIdToContract[drawId_] = providerAdd;
        userToDrawIds[msg.sender].push(drawId_);
        uint256 value = _getBaseFeeForWallet(); // Check if wallet has a custom fee
        uint256 purchasedTxns = _getAvailableTxnsForWallet(); // Check if wallet has purchased bundle txns
        uint256 serviceFee = _calculateVRFCost(0); // Calculate estimate chainlink fee denominated to native in wei
        value = value == 0 ? baseFee : value; // If user doesn't have a custom fee user base fee
        ofe += serviceFee;
        if (purchasedTxns == 0) {
            require((msg.value >= value+serviceFee - highSlippage*((serviceFee)/100)) && (msg.value <= value+serviceFee + lowSlippage*((serviceFee)/100)), "NVV"); // We allow a highSlippage% change on gas price fow small spikes
        } else {
            require((msg.value >= serviceFee - highSlippage*(serviceFee/100)) && (msg.value <= serviceFee + lowSlippage*((serviceFee)/100)), "NVV"); // We allow a highSlippage% change on gas price fow small spikes
            _updateAvailableTxnsForWallet();
        }
        // Calls the active chainlink contract and initialises the request
        ISlashTokenDraw(providerAdd).createNewErc20Draw(drawId_, msg.sender, erc20Token, rootHash, numOfWinners, numOfParticipants, winningAmountPerUser);
    }

    /**
        @notice Native draw with equal amount to all winners
        @param drawId_ The draw's id
        @param rootHash The root of the merkle tree
        @param numOfWinners The number of total winners
        @param numOfParticipants The number of total participants
        @param winningAmountPerUser The amount each winner gonna get

        @dev Initialises a new native draw using Chainlink's VRF

        Requirements:
        - Contract must not be frozen
        - Caller must not be denylisted
        - Contract must be initialised
        - `drawId_` must not been used before
        - `numOfWinners` must be greater than 0 and less than 101 and equal or less than participants
        - `numOfParticipants` must be greater than 0 and less than 100001
        - There must be an active chainlink contract
        - The caller must provide a correct msg.value
    **/
    function createNewNativeDrawChainlink(bytes32 drawId_, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser) external payable {
        require(denylist[msg.sender] == 0, 'UD');
        require(frozen == 0, 'CF');
        require(isInitialized != 0, 'NIY');
        require(numOfWinners != 0 && numOfWinners <= 100 && numOfWinners <= numOfParticipants, 'NVW');
        require(numOfParticipants != 0 && numOfParticipants <= 100000, 'NVP');
        require(drawIdToContract[drawId_] == address(0), 'DIU');
        address providerAdd =  providerToAddress[validProviders.CHAINLINK];
        require(providerAdd != address(0), "NVPR");
        drawIdToContract[drawId_] = providerAdd;
        userToDrawIds[msg.sender].push(drawId_);
        uint256 value = _getBaseFeeForWallet(); // Check if wallet has a custom fee
        uint256 purchasedTxns = _getAvailableTxnsForWallet(); // Check if wallet has purchased bundle txns
        uint256 serviceFee = _calculateVRFCost(0); // Calculate estimate chainlink fee denominated to native in wei
        value = value == 0 ? baseFee : value; // If user doesn't have a custom fee user base fee
        ofe += serviceFee;
        if (purchasedTxns == 0) {
            require((msg.value >= value+serviceFee - highSlippage*((serviceFee)/100)) && (msg.value <= value+serviceFee + lowSlippage*((serviceFee)/100)), "NVV"); // We allow a highSlippage% change on gas price fow small spikes
        } else {
            require((msg.value >= serviceFee - highSlippage*(serviceFee/100)) && (msg.value <= serviceFee + lowSlippage*((serviceFee)/100)), "NVV"); // We allow a highSlippage% change on gas price fow small spikes
            _updateAvailableTxnsForWallet();
        }
        ISlashTokenDraw(providerAdd).createNewNativeDraw(drawId_, msg.sender, rootHash, numOfWinners, numOfParticipants, winningAmountPerUser);
    }

    /**
        @notice ERC-721 token draw with equal amount to all winners
        @param drawId_ The draw's id
        @param erc721Token The address of the token to airdrop
        @param rootHash The root of the merkle tree
        @param numOfWinners The number of total winners
        @param numOfParticipants The number of total participants
        @param erc721TokenIds The tokenIds each winner gonna get

        @dev Initialises a new erc721 draw using Chainlink's VRF

        Requirements:
        - Contract must not be frozen
        - Caller must not be denylisted
        - Contract must be initialised
        - `drawId_` must not been used before
        - `numOfWinners` must be greater than 0 and less than 101 and equal or less than participants
        - `numOfParticipants` must be greater than 0 and less than 100001
        - `erc721TokenIds` length must match the `numOfParticipants`
        - There must be an active chainlink contract
        - The caller must provide a correct msg.value
    **/
    function createNewErc721DrawChainlink(bytes32 drawId_, address erc721Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256[] memory erc721TokenIds) external payable {
        require(frozen == 0, 'CF');
        require(denylist[msg.sender] == 0, 'UD');
        require(isInitialized != 0, 'NIY');
        require(numOfWinners != 0 && numOfWinners <= 100 && numOfWinners <= numOfParticipants, 'NVW');
        require(numOfParticipants != 0 && numOfParticipants <= 100000, 'NVP');
        require(numOfWinners == erc721TokenIds.length, 'NVL');
        require(drawIdToContract[drawId_] == address(0), 'DIU');
        address providerAdd =  providerToAddress[validProviders.CHAINLINK];
        require(providerAdd != address(0), "NVPR");
        drawIdToContract[drawId_] = providerAdd;
        userToDrawIds[msg.sender].push(drawId_);
        uint256 value = _getBaseFeeForWallet(); // Check if wallet has a custom fee
        uint256 purchasedTxns = _getAvailableTxnsForWallet(); // Check if wallet has purchased bundle txns
        uint256 serviceFee = _calculateVRFCost(0); // Calculate estimate chainlink fee denominated to native in wei
        value = value == 0 ? baseFee : value;  // If user doesn't have a custom fee user base fee
        ofe += serviceFee;
        if (purchasedTxns == 0) {
            require((msg.value >= value+serviceFee - highSlippage*((serviceFee)/100)) && (msg.value <= value+serviceFee + lowSlippage*((serviceFee)/100)), "NVV"); // We allow a highSlippage% change on gas price fow small spikes
        } else {
            require((msg.value >= serviceFee - highSlippage*(serviceFee/100)) && (msg.value <= serviceFee + lowSlippage*((serviceFee)/100)), "NVV"); // We allow a highSlippage% change on gas price fow small spikes
            _updateAvailableTxnsForWallet();
        }
        ISlashTokenDraw(providerAdd).createNewErc721Draw(drawId_, msg.sender, erc721Token, rootHash, numOfWinners, numOfParticipants, keccak256(abi.encodePacked(erc721TokenIds)));
    }

    /**
        @notice ERC-20 token draw with equal amount to all winners
        @param drawId_ The draw's id
        @param erc20Token The address of the token to airdrop
        @param rootHash The root of the merkle tree
        @param numOfWinners The number of total winners
        @param numOfParticipants The number of total participants
        @param winningAmountPerUser The amount each winner gonna get
        @param commitment Caller's secret number keccak256 hash

        @dev Initialises a new erc20 draw using Pyth's VRF

        Requirements:
        - Contract must not be frozen
        - Caller must not be denylisted
        - Contract must be initialised
        - `drawId_` must not been used before
        - `numOfWinners` must be greater than 0 and less than 101 and equal or less than participants
        - `numOfParticipants` must be greater than 0 and less than 100001
        - There must be an active Pyth contract
        - The caller must provide a correct msg.value
    **/
    function createNewErc20DrawPyth(bytes32 drawId_, address erc20Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser, bytes32 commitment) external payable {
        require(frozen == 0, 'CF');
        require(denylist[msg.sender] == 0, 'UD');
        require(isInitialized != 0, 'NIY');
        require(numOfWinners != 0 && numOfWinners <= 100 && numOfWinners <= numOfParticipants, 'NVW');
        require(numOfParticipants != 0 && numOfParticipants <= 100000, 'NVP');
        require(drawIdToContract[drawId_] == address(0), 'DIU');
        address providerAdd =  providerToAddress[validProviders.PYTH];
        require(providerAdd != address(0), "NVPR");
        drawIdToContract[drawId_] = providerAdd;
        userToDrawIds[msg.sender].push(drawId_);
        uint256 value = _getBaseFeeForWallet(); // Check if wallet has a custom fee
        uint256 purchasedTxns = _getAvailableTxnsForWallet(); // Check if wallet has purchased bundle txns
        uint256 serviceFee = _calculateVRFCost(1); // Calculate estimate chainlink fee denominated to native in wei
        value = value == 0 ? baseFee : value;  // If user doesn't have a custom fee user base fee
        if (purchasedTxns == 0) {
            require((msg.value == value+serviceFee), "NVV");
        } else {
            require((msg.value == serviceFee), "NVV");
            _updateAvailableTxnsForWallet();
        }
        ISlashTokenDrawPyth(providerAdd).createNewErc20Draw{value: serviceFee}(drawId_, msg.sender, erc20Token, rootHash, numOfWinners, numOfParticipants, winningAmountPerUser, commitment, serviceFee);
    }

    /**
        @notice Native draw with equal amount to all winners
        @param drawId_ The draw's id
        @param rootHash The root of the merkle tree
        @param numOfWinners The number of total winners
        @param numOfParticipants The number of total participants
        @param winningAmountPerUser The amount each winner gonna get
        @param commitment Caller's secret number keccak256 hash

        @dev Initialises a new erc20 draw using Pyth's VRF

        Requirements:
        - Contract must not be frozen
        - Caller must not be denylisted
        - Contract must be initialised
        - `drawId_` must not been used before
        - `numOfWinners` must be greater than 0 and less than 101 and equal or less than participants
        - `numOfParticipants` must be greater than 0 and less than 100001
        - There must be an active Pyth contract
        - The caller must provide a correct msg.value
    **/
    function createNewNativeDrawPyth(bytes32 drawId_, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants, uint256 winningAmountPerUser, bytes32 commitment) external payable {
        require(frozen == 0, 'CF');
        require(denylist[msg.sender] == 0, 'UD');
        require(isInitialized != 0, 'NIY');
        require(numOfWinners != 0 && numOfWinners <= 100 && numOfWinners <= numOfParticipants, 'NVW');
        require(numOfParticipants != 0 && numOfParticipants <= 100000, 'NVP');
        require(drawIdToContract[drawId_] == address(0), 'DIU');
        address providerAdd =  providerToAddress[validProviders.PYTH];
        require(providerAdd != address(0), "NVPR");
        drawIdToContract[drawId_] = providerAdd;
        userToDrawIds[msg.sender].push(drawId_);
        uint256 value = _getBaseFeeForWallet(); // Check if wallet has a custom fee
        uint256 purchasedTxns = _getAvailableTxnsForWallet(); // Check if wallet has purchased bundle txns
        uint256 serviceFee = _calculateVRFCost(1); // Calculate estimate chainlink fee denominated to native in wei
        value = value == 0 ? baseFee : value; // If user doesn't have a custom fee user base fee
        if (purchasedTxns == 0) {
            require((msg.value == value+serviceFee), "NVV");
        } else {
            require((msg.value == serviceFee), "NVV");
            _updateAvailableTxnsForWallet();
        }
        ISlashTokenDrawPyth(providerAdd).createNewNativeDraw{value: serviceFee}(drawId_, msg.sender, rootHash, numOfWinners, numOfParticipants, winningAmountPerUser, commitment, serviceFee);
    }

    /**
        @notice ERC-721 token draw with equal amount to all winners
        @param drawId_ The draw's id
        @param erc721Token The address of the token to airdrop
        @param rootHash The root of the merkle tree
        @param numOfWinners The number of total winners
        @param numOfParticipants The number of total participants
        @param erc721TokenIds The tokenIds each winner gonna get
        @param commitment Caller's secret number keccak256 hash

        @dev Initialises a new erc20 draw using Pyth's VRF

        Requirements:
        - Contract must not be frozen
        - Caller must not be denylisted
        - Contract must be initialised
        - `drawId_` must not been used before
        - `numOfWinners` must be greater than 0 and less than 101 and equal or less than participants
        - `numOfParticipants` must be greater than 0 and less than 100001
        - `erc721TokenIds` length must match the `numOfParticipants`
        - There must be an active Pyth contract
        - The caller must provide a correct msg.value
    **/
    function createNewErc721DrawPyth(bytes32 drawId_, address erc721Token, bytes32 rootHash, uint256 numOfWinners, uint256 numOfParticipants,  uint256[] memory erc721TokenIds, bytes32 commitment) external payable {
        require(frozen == 0, 'CF');
        require(denylist[msg.sender] == 0, 'UD');
        require(isInitialized != 0, 'NIY');
        require(numOfWinners != 0 && numOfWinners <= 100 && numOfWinners <= numOfParticipants, 'NVW');
        require(numOfParticipants != 0 && numOfParticipants <= 100000, 'NVP');
        require(drawIdToContract[drawId_] == address(0), 'DIU');
        address providerAdd =  providerToAddress[validProviders.PYTH];
        require(providerAdd != address(0), "NVPR");
        drawIdToContract[drawId_] = providerAdd;
        userToDrawIds[msg.sender].push(drawId_);
        uint256 value = _getBaseFeeForWallet(); // Check if wallet has a custom fee
        uint256 purchasedTxns = _getAvailableTxnsForWallet(); // Check if wallet has purchased bundle txns
        uint256 serviceFee = _calculateVRFCost(1); // Calculate estimate chainlink fee denominated to native in wei
        value = value == 0 ? baseFee : value; // If user doesn't have a custom fee user base fee
        if (purchasedTxns == 0) {
            require((msg.value == value+serviceFee), "NVV");
        } else {
            require((msg.value == serviceFee), "NVV");
            _updateAvailableTxnsForWallet();
        }
        ISlashTokenDrawPyth(providerAdd).createNewErc721Draw{value: serviceFee}(drawId_, msg.sender, erc721Token, rootHash, numOfWinners, numOfParticipants, keccak256(abi.encodePacked(erc721TokenIds)), commitment, serviceFee);
    }
}


