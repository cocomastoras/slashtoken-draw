// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../handshake-registry-types/IAggregator.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";

contract PriceFeed {
    /// @dev multiplier to produce premium fee
    uint256 internal multiplier;
    /// @dev divisor to produce premium fee
    uint256 internal divisor;
    /// @dev max gas limit for active gas lane
    uint256 internal gasLimit;
    /// @dev Link's price feed
    address internal priceFeedAddress;
    /// @dev active coordinator's subscription id
    uint256 internal subscriptionId;
    IVRFCoordinatorV2Plus internal COORDINATOR;

    /// @dev Entropies's configuration
    IEntropy internal entropy;
    address internal provider = 0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344;

    constructor(){}

    /**
        @notice Internal function that initialises the price feed config
        @param priceFeed The price feed's address
        @param vrfCoordinator_ The coordinator's address
        @param entropyProvider_ The entropy's address
        @param multiplier_ The premium link fee multiplier
        @param divisor_ The premium link fee divisor
        @param gasLimit_ The max gas limit for active lane
        @param subscriptionId_ The sub id
    **/
    function _initialisePriceFeed(address priceFeed, address vrfCoordinator_, address entropyProvider_, uint256 multiplier_, uint256 divisor_, uint256 gasLimit_, uint256 subscriptionId_) internal {
        priceFeedAddress = priceFeed;
        COORDINATOR = IVRFCoordinatorV2Plus(vrfCoordinator_);
        entropy = IEntropy(entropyProvider_);
        multiplier = multiplier_;
        divisor = divisor_;
        gasLimit = gasLimit_;
        subscriptionId = subscriptionId_;
    }

    /**
        @notice Internal view function that estimates the service fee
        @param network 0 for chainlink , 1 for pyth
    **/
    function _calculateVRFCost(uint256 network) internal view returns (uint256 nativeRequired) {
         if(network == 0 ){
             IAggregator priceFeed = IAggregator(priceFeedAddress);
             (uint96 balanceLink,,,,) = COORDINATOR.getSubscription(subscriptionId);
             (,int256 answer,,,) = priceFeed.latestRoundData();
             uint256 currentBalanceToWei;
             uint256 minBalanceRequired;
             uint256 gasPrice;
             uint256 gasLimit_ = gasLimit;
             uint256 multiplier_ = multiplier;
             uint256 divisor_ = divisor;
             assembly {
                currentBalanceToWei := div(mul(balanceLink, answer), exp(10,18))
                let linkPremiumToWei := div(mul(multiplier_, answer), divisor_)
                minBalanceRequired := add(linkPremiumToWei, mul(mul(gasLimit_,exp(10,9)), 215000))
                nativeRequired := add(linkPremiumToWei, mul(gasprice(), 215000))
                gasPrice := gasprice()
             }
             require(gasPrice <= gasLimit_*10**9, 'GH');
             require(currentBalanceToWei >= minBalanceRequired, 'NVCB');
         } else {
             nativeRequired = entropy.getFee(provider);
         }
    }

    /**
        @notice External view function that estimates the service fee
        @param network 0 for chainlink , 1 for pyth

        Returns the native required and for chainlink's draws a status code where:
            -2 : gas price higher than limit
            -1 : not enough balance in the coordinator
            >0 : coordinator's balance
    **/
    function calculateVRFCost(uint256 network, uint256 gasPrice) external view returns (uint256 nativeRequired, int256 statusCode) {
        if(network == 0) {
            IAggregator priceFeed = IAggregator(priceFeedAddress);
            (uint96 balanceLink,,,,) = COORDINATOR.getSubscription(subscriptionId);
            (,int256 answer,,,) = priceFeed.latestRoundData();
            uint256 currentBalanceToWei;
            uint256 minBalanceRequired;
            uint256 gasLimit_ = gasLimit;
            uint256 multiplier_ = multiplier;
            uint256 divisor_ = divisor;
            assembly {
                currentBalanceToWei := div(mul(balanceLink, answer), exp(10,18))
                let linkPremiumToWei := div(mul(multiplier_, answer), divisor_)
                minBalanceRequired := add(linkPremiumToWei, mul(mul(gasLimit_,exp(10,9)), 215000))
                nativeRequired := add(linkPremiumToWei, mul(gasPrice, 215000))
            }
            if(gasPrice > gasLimit_*(10**9)){
                statusCode = -2;
            } else {
                if (currentBalanceToWei >= minBalanceRequired) {
                    statusCode = int256(uint256(balanceLink));
                } else {
                    statusCode = -1;
                }
            }
        } else {
            nativeRequired = entropy.getFee(provider);
        }
    }
}
