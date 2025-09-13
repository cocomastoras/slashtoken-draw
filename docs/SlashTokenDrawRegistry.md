# Draw-Registry documentation
SlashToken draw registry is the base contract where admin declares the active chainlink and/or pyth contracts , and handles all the admin operations.

## User Transactions reference
The possible user transactions are:

- createNewErc20DrawChainlink
- createNewNativeDrawChainlink
- createNewErc721DrawChainlink
- createNewErc20DrawPyth
- createNewNativeDrawPyth
- createNewErc721DrawPyth
- buyTxnsBundle

Details are presented below:

### createNewErc20DrawChainlink
The __createNewErc20DrawChainlink__ action takes 6 argument as input:
- drawId_: bytes32, The unique identifier of the draw
- erc20Token: address, The address of the token to airdrop
- rootHash: bytes32, The merkle tree's root for the given participants
- numOfWinners: uint256, The total number of winners
- numOfParticipants: uint256, The total number of participants
- winningAmountPerUser: uint256, The amount each winner will get

Reverts:
- CF: If contract is frozen
- UD: If caller is in denylist
- NIY: If contract is not initialized
- NVW: If numOfWinners is greater than 100 or 0
- NVP: If numOfParticipants is greater than 100k or 0
- DIU: If drawId_ already used
- NVPR: If there is not active chainlink contract
- NVV: If msg.value not equal base fee or promo fee if user doesn't have puschasedTxns plus estimated service fee 

Sends a request to the SlashTokenChainlink contract to initialise the draw

### createNewNativeDrawChainlink
The __createNewNativeDrawChainlink__ action takes 5 argument as input:
- drawId_: bytes32, The unique identifier of the draw
- rootHash: bytes32, The merkle tree's root for the given participants
- numOfWinners: uint256, The total number of winners
- numOfParticipants: uint256, The total number of participants
- winningAmountPerUser: uint256, The amount each winner will get

Reverts:
- CF: If contract is frozen
- UD: If caller is in denylist
- NIY: If contract is not initialized
- NVW: If numOfWinners is greater than 100 or 0
- NVP: If numOfParticipants is greater than 100k or 0
- DIU: If drawId_ already used
- NVPR: If there is not active chainlink contract
- NVV: If msg.value not equal base fee or promo fee if user doesn't have puschasedTxns plus estimated service fee 

Sends a request to the SlashTokenChainlink contract to initialise the draw

### createNewErc721DrawChainlink
The __createNewErc721DrawChainlink__ action takes 6 argument as input:
- drawId_: bytes32, The unique identifier of the draw
- erc721Token: address, The address of the token to airdrop
- rootHash: bytes32, The merkle tree's root for the given participants
- numOfWinners: uint256, The total number of winners
- numOfParticipants: uint256, The total number of participants
- erc721Ids: uint256[], The tokenIds to airdrop to each winner

Reverts:
- CF: If contract is frozen
- UD: If caller is in denylist
- NIY: If contract is not initialized
- NVW: If numOfWinners is greater than 100 or 0
- NVP: If numOfParticipants is greater than 100k or 0
- NVL: If tokenIds length doesnt match num of winners
- DIU: If drawId_ already used
- NVPR: If there is not active chainlink contract
- NVV: If msg.value not equal base fee or promo fee if user doesn't have puschasedTxns plus estimated service fee 

Sends a request to the SlashTokenChainlink contract to initialise the draw

### createNewErc20DrawPyth
The __createNewErc20DrawPyth__ action takes 7 argument as input:
- drawId_: bytes32, The unique identifier of the draw
- erc20Token: address, The address of the token to airdrop
- rootHash: bytes32, The merkle tree's root for the given participants
- numOfWinners: uint256, The total number of winners
- numOfParticipants: uint256, The total number of participants
- winningAmountPerUser: uint256, The amount each winner will get
- commitment: bytes32, The user's secret number commitment

Reverts:
- CF: If contract is frozen
- UD: If caller is in denylist
- NIY: If contract is not initialized
- NVW: If numOfWinners is greater than 100 or 0
- NVP: If numOfParticipants is greater than 100k or 0
- DIU: If drawId_ already used
- NVPR: If there is not active pyth contract
- NVV: If msg.value not equal base fee or promo fee if user doesn't have puschasedTxns plus estimated service fee 

Sends a request to the SlashTokenPyth contract to initialise the draw

### createNewNativeDrawPyth
The __createNewNativeDrawPyth__ action takes 5 argument as input:
- drawId_: bytes32, The unique identifier of the draw
- rootHash: bytes32, The merkle tree's root for the given participants
- numOfWinners: uint256, The total number of winners
- numOfParticipants: uint256, The total number of participants
- winningAmountPerUser: uint256, The amount each winner will get
- commitment: bytes32, The user's secret number commitment

Reverts:
- CF: If contract is frozen
- UD: If caller is in denylist
- NIY: If contract is not initialized
- NVW: If numOfWinners is greater than 100 or 0
- NVP: If numOfParticipants is greater than 100k or 0
- DIU: If drawId_ already used
- NVPR: If there is not active pyth contract
- NVV: If msg.value not equal base fee or promo fee if user doesn't have puschasedTxns plus estimated service fee 

Sends a request to the SlashTokenPyth contract to initialise the draw

### createNewErc721DrawPyth
The __createNewErc721DrawPyth__ action takes 6 argument as input:
- drawId_: bytes32, The unique identifier of the draw
- erc721Token: address, The address of the token to airdrop
- rootHash: bytes32, The merkle tree's root for the given participants
- numOfWinners: uint256, The total number of winners
- numOfParticipants: uint256, The total number of participants
- erc721Ids: uint256[], The tokenIds to airdrop to each winner
- commitment: bytes32, The user's secret number commitment

Reverts:
- CF: If contract is frozen
- UD: If caller is in denylist
- NIY: If contract is not initialized
- NVW: If numOfWinners is greater than 100 or 0
- NVP: If numOfParticipants is greater than 100k or 0
- NVL: If tokenIds length doesnt match num of winners
- DIU: If drawId_ already used
- NVPR: If there is not active pyth contract
- NVV: If msg.value not equal base fee or promo fee if user doesn't have puschasedTxns plus estimated service fee 

Sends a request to the SlashTokenPyth contract to initialise the draw

### buyTxnsBundle
The __buyTxnsBundle__ action takes 2 argument as input:
- bundleIndex: uint256
- quantity: uint256

Reverts:
- CF: If contract is frozen
- NVA: If quantity is zero 
- NVV: If not correct msg.value
- UD: If caller is in denylist

Emits:
- TxnsBundleBought

User buys a bundle of transactions giving the index of the bundle he wants to buy and defining the quantity of bundles he wants

## Structs
    PriceFeedInitiator: 
        address priceFeed;
        address vrfCoordinator;
        address entropyProvider;
        uint256 multiplier;
        uint256 divisor;
        uint256 gasLimit;
        uint64 subscriptionId;

## Admin transactions reference

The possible admin transactions are:
- initialize
- setBaseFeeForWallet
- resetBaseFeeForWallet
- addTxnsToWallets
- setNewBaseFee
- updateBundles
- freezeContract
- updateFeeSink
- updateConfigs
- claimFees
- addToDenylist
- removeFromDenylist

Details are presented below:

### initialize
The __initialize__ action takes 8 argument as input:
- admin: address, The contract's admin
- feeSink: address, The feesink address
- chainlink_: address, The address of the SlashTokenDrawChainlink contract or address(0)
- pyth_: address, The address of the SlashTokenDrawPyth contract or address(0)
- baseFeeCostInWei: uint256, The base fee cost
- availableTxnsBundles_: uint256[], The available bundles
- txnsBundlesToPrice_: uint256[], The bundle's cost
- priceFeedInitiator: PriceFeedInitiator_, Includes the priceFeeds address, the vrfCoordinator's address, the entropy's address, the multipliet and divisor of min Link per network, the gasLane limit per network and the subId

Reverts:
- AI: If already initialised
- NVD: If availableTxnsBundles length not equals txnsBundlesToPrice length

Caller initializes the contract

### setBaseFeeForWallet
The __setBaseFeeForWallet__ action takes 2 argument as input:
- wallet address
- amountInWei uint256

Reverts:
- NVS: If not correct caller
- NVV: If declared value is higher than the normal

Emits:
- NewWalletBaseFee

Admin whitelists a user's wallet to have new basefee per no bundle txn until it resets

### resetBaseFeeForWallet
The __resetBaseFeeForWallet__ action takes 1 argument as input:
- wallet address

Reverts:
- NVS: If not correct caller

Emits:
- WalletBaseFeeReset

Admin resets a user's wallet to have standard basefee per no bundle txn until

### addTxnsToWallets
The __addTxnsToWallet__ action takes 2 argument as input:
- wallets address[]
- txns uint256[]

Reverts:
- NVS: If not correct caller
- NVL: If wallets length not match txns length

Emits:
- TxnsAdded

Admin adds free txns to given wallets

### setNewBaseFee
The __setNewBaseFee__ action takes 1 argument as input:
- baseFee_ uint256

Reverts:
- NVS: If not correct caller

Admin updates the baseFee

### updateBundles
The __updateBundles__ action takes 2 argument as input:
- availableTxnsBundles_: uint256[]
- txnsBundlesToPrice_: uint256[]

Reverts:
- NVS: If not correct caller
- NVD: If availableTxnsBundles length not equals txnsBundlesToPrice length

Emits:
- BundlesUpdated

Admin updated available bundles

### freezeContract
The __freezeContract__ action takes 1 argument as input:
- value_ uint256

Reverts:
- NVS: If not correct caller

Admin freezes/unfreezes the contract

### updateFeeSink
The __updateFeeSink__ action takes 1 argument as input:
- feeSink_ address

Reverts:
- NVS: If not correct caller

Admin updates the feeSink address

### updateConfigs
The __updateConfigs__ action takes 10 argument as input:
- chainlinkDraw__:  address, The active chainlink contract or address(0)
- pythDraw__: address, The active pyth contract or address(0)
- entropyAddress__: address, The pyth's entropy address
- providerAddress__: address, The pyth's provider address
- coordinatorAddress__: address, The coordinator's address
- subId__: uint64, The vrf's sub id
- priceFeedAddress_ address
- multiplier_: uint256, The multiplier to produce the premium Link per network
- divisor_: uint256, The divisor to produce the premium Link per network
- gasLimit_: uint256, The higher gasLimit for the selected lane

Reverts:
- NVS: If not correct caller

Admin updates the chainlinkDraw and pythDraw contract addresses, the entropy's, coordinator's and price feed configs, the max gasLimit of coordinator and multiplier/divisor to produce the premium Link fee per network

### claimFees
The __claimFees__ action takes 0 argument as input:

Reverts:
- NVS: If not correct caller

Emits:
- Claimed

Admin withdraw all contract's fees to the feeSink address  and emits an invent indicatind the protocol fees and service fees


### addToDenylist
The __addToDenylist__ action takes 1 argument as input:
- list: uint256[]

Reverts:
- NVS: If not correct caller

Admin adds a list of addresses in denylist

### removeFromDenylist
The __removeFromDenylist__ action takes 1 argument as input:
- list: uint256[]

Reverts:
- NVS: If not correct caller

Admin removes a list of addresses from denylist



## Internal transactions reference

- _getBaseFeeForWallet
- _getAvailableTxnsForWallet
- _updateAvailableTxnsForWallet
- _checkPythAddresses
- _checkChainlinkAddresses
- _calculateVRFCost

Details are presented below:


### _getBaseFeeForWallet
The ___getBaseFeeForWallet__ action takes 0 argument as input:

Returns
- BaseFee uint256

Internal view function that returns the given user's premium fee or zero

### _getAvailableTxnsForWallet
The ___getAvailableTxnsForWallet__ action takes 0 argument as input:

Internal view function that returns the available txns to the connected wallet

### _updateAvailableTxnsForWallet
The ___updateAvailableTxnsForWallet__ action takes 0 argument as input:

Internal txns that consumes a txns from the caller

### _checkPythAddresses
The ___checkPythAddresses__ action takes 1 argument as input:
- contract_: address, The contract's address to check

Returns
- bool

Internal view function that returns true if the provided address is a past or current pyth contract

### _checkChainlinkAddresses
The ___checkChainlinkAddresses__ action takes 1 argument as input:
- contract_: address, The contract's address to check

Returns
- bool

Internal view function that returns true if the provided address is a past or current chainlink contract

### _calculateVRFCost
The ___calculateVRFCost__ action takes 1 argument as input:
- network: uint256, 0 for chainlink, 1 for pyth

Reverts:
- GH, If gas price higher than gas lane
- NVCB, If vrf below min balance

Internal txns that caclulates the vrf cost in wei for either chainlink or pyth


## Events:
    event WalletBaseFeeSet(address indexed Wallet, uint256 BaseFeeInWei);
    event WalletBaseFeeReset(address indexed Wallet);
    event TxnsAdded(address[] Wallet, uint256[] Txns);
    event TxnsBundleBought(address indexed Buyer, uint256 Amount, uint256 Txns);
    event BundlesUpdated(address indexed Operator, uint256[] BundlesAmounts, uint256[] BundlesPrices);
    event Claimed(uint256 SF, uint256 OF);

## View transactions:
- getBundles
- getAvailableTxnsForWallet
- getUsersThatBoughtBundles
- getBaseFeeForWallet
- getDenylist
- calculateVRFCost
- getInfo
- getRequestIdForDrawId
- getDrawStatus
- getRequestResponse
- getProviderInfoAndSequenceNumber
- getDistributionBlock
- getUserDrawIds



### getBundles():
Retuns the lists of available bundles and pricing

### getAvailableTxnsForWallet():
Retuns callers available txns 

### getUsersThatBoughtBundles():
Retuns a list of addresses that bought txns bundles

### getBaseFeeForWallet():
Retuns callers promo base fee or 0

### getDenylist():
Returns the list of addresses that are in denylist

### calculateVRFCost
The __calculateVRFCost__ action takes 1 argument as input:
- network: uint256, 0 for chainlink, 1 for pyth

Returns
- nativeRequired: uint256
- statusCide: int256, -2 Gas price higher than limit, -1 Vrf below min balance, >0 vrf's balance 

External view txns that caclulates the vrf cost in wei for either chainlink or pyth and also returns a status code 

### getInfo():
Returns the protocol's fees and service fees

### getRequestIdForDrawId():
The __getRequestIdForDrawId__ action takes 1 argument as input:
- drawId_: bytes32,

Checks if the drawId exists and what provider it belongs and returns the requestId else returns 0

### getDrawStatus():
The __getDrawStatus__ action takes 1 argument as input:
- drawId_ : bytes32

External view function that returns the currents draws status 

### getRequestResponse():
The __getRequestResponse__ action takes 1 argument as input:
- drawId_ : bytes32

Returns the given drawId's VRF/entropy response if exists or 0

### getProviderInfoAndSequenceNumber():
The __getProviderInfoAndSequenceNumber__ action takes 1 argument as input:
- drawId_ : bytes32

Returns the url of the provider and the drawId's sequence number if its a pyth draw

### getDistributionBlock():
The __getDistributionBlock__ action takes 1 argument as input:
- drawId_ : bytes32

Returns block that the draw completed

### getUserDrawIds():
The __getUserDrawIds__ action takes 1 argument as input:
- user : address

Returns for the given address a list wiith all the drawIds and a list of uints where 0 means chainlink and 1 means pyth