// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import {ContractRegistry} from "./ContractRegistry.sol";
import {PriceFeed} from "./PriceFeed.sol";

contract ManagerActions is ContractRegistry, PriceFeed {
    event Claimed(uint256 SF, uint256 OF);
    /// @dev Accepted slippages of calculated service fee on execution and estimation
    uint256 internal lowSlippage = 1;
    uint256 internal highSlippage = 1;
    /// @dev Registry's owner
    address internal owner;
    /// @dev Registry's feeSink
    address internal feeSink;
    /// @dev Registry's freeze status
    uint256 public frozen;
    /// @dev Provider fees
    uint256 internal ofe;
    /// @dev User's address to denylist flag
    mapping(address => uint256) internal denylist;
    using EnumerableSet for EnumerableSet.AddressSet;
    /// @dev list of denied addresses
    EnumerableSet.AddressSet internal deniedAddresses;
    /// @dev list of pyth draw addresses
    EnumerableSet.AddressSet internal pythAddresses;
    /// @dev list of chainlink draw addresses
    EnumerableSet.AddressSet internal chainlinkAddresses;

    constructor(){}

    /**
        @notice Admin freezes / unfreezes contracts
        @param value_ 0 = unfreeze, any other value = freeze
    */
    function freezeContract(uint256 value_) external {
        require(msg.sender == owner, 'NVS');
        frozen = value_;
    }

    /**
        @notice Admin updates fee sink address
        @param feeSink_ The new fee sink address
    */
    function updateFeeSink(address feeSink_) external {
        require(msg.sender == owner, 'NVS');
        feeSink = feeSink_;
    }

    /**
        @notice Admin updates the config
        @param chainlinkDraw_ The new chainlink draw contract address or address(0)
        @param pythDraw_ The new pyth draw contract address or address(0)
        @param entropyAddress_ The new entropy's address
        @param providerAddress_ The new provider's address
        @param coordinatorAddress_ The new chainlink coordinator address
        @param subId_ The new suscription id
        @param priceFeedAddress_ The new price feed's address
        @param multiplier_ The new multiplier
        @param divisor_ The new divisor
        @param gasLimit_ The new max gas limit

        @dev Updates the chainlinkDraw and pythDraw contract addresses, the entropy's, coordinator's and price feed configs, the max gasLimit of coordinator and multiplier/divisor to produce the premium Link fee per network
    */
    function updateConfigs(address chainlinkDraw_, address pythDraw_, address entropyAddress_, address providerAddress_, address coordinatorAddress_, uint64 subId_, address priceFeedAddress_, uint256 multiplier_, uint256 divisor_, uint256 gasLimit_) external {
        require(msg.sender == owner, 'NVS');
        if(pythDraw_ != address(0)){
            pythAddresses.add(pythDraw_);
        }
        if(chainlinkDraw_ != address(0)){
            chainlinkAddresses.add(chainlinkDraw_);
        }
        providerToAddress[validProviders.CHAINLINK] = chainlinkDraw_;
        providerToAddress[validProviders.PYTH] = pythDraw_;
        entropy = IEntropy(entropyAddress_);
        provider = providerAddress_;
        COORDINATOR = IVRFCoordinatorV2Plus(coordinatorAddress_);
        subscriptionId = subId_;
        priceFeedAddress = priceFeedAddress_;
        multiplier = multiplier_;
        divisor = divisor_;
        gasLimit = gasLimit_;
    }

    function updateSlippage(uint256 lowSlippage_, uint256 highSlippage_) external {
        require(msg.sender == owner, 'NVS');
        lowSlippage = lowSlippage_;
        highSlippage = highSlippage_;
    }

    /**
        @notice Admin claims contract fees
    */
    function claimFees() external {
        address owner_ = owner;
        uint256 cBalance;
        uint256 of_ = ofe;
        ofe = 0;
        assembly {
            if iszero(eq(caller(), owner_)) {
                revert(0,0)
            }
            cBalance := selfbalance()
            if iszero(call(gas(), sload(feeSink.slot), selfbalance(), 0, 0, 0, 0)) {
                revert(0,0)
            }
        }
        emit Claimed(cBalance - of_, of_);
    }

    /**
        @notice Admin adds addresses to denylist
        @param list A list of addresses to add
    */
    function addToDenylist(address[] memory list) external {
        require(msg.sender == owner, 'NVS');
        uint len = list.length;
        for(uint i = 0; i < len;) {
            if (!deniedAddresses.contains(list[i])) {
                deniedAddresses.add(list[i]);
            }
            unchecked {
                denylist[list[i]] = 1;
                i++;
            }
        }
    }

    /**
        @notice Admin removes addresses to denylist
        @param list A list of addresses to remove
    */
    function removeFromDenylist(address[] memory list) external {
        require(msg.sender == owner, 'NVS');
        uint len = list.length;
        for(uint i = 0; i < len;) {
            if (deniedAddresses.contains(list[i])) {
                deniedAddresses.remove(list[i]);
            }
            unchecked {
                denylist[list[i]] = 0;
                i++;
            }
        }
    }

    /**
        @notice External view function that returns the list of denied addresses
    */
    function getDenylist() external view returns (address[] memory) {
        require(msg.sender == owner, 'NVS');
        return deniedAddresses.values();
    }

    /**
        @notice External view function that protocol and service fees
    */
    function getInfo() external view returns(uint256, uint256) {
        return(address(this).balance - ofe, ofe);
    }

    /**
        @notice Internal view function that returns true if given address is a current or past pythDraw address
        @param contract_ Address to check
    */
    function _checkPythAddresses(address contract_) internal view returns (bool) {
        return pythAddresses.contains(contract_);
    }

    /**
        @notice Internal view function that returns true if given address is a current or past chainlinkDraw address
        @param contract_ Address to check
    */
    function _checkChainlinkAddresses(address contract_) internal view returns (bool) {
        return chainlinkAddresses.contains(contract_);
    }
}
