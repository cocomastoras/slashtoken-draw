# Draw-Pyth documentation
SlashToken draw is an onchain lottery and airdrop tool where users can create draws for up to 100k participants and 100 winners for ERC20, ERC721 tokens and Natice Currency leveraging merkle trees and pyth VRF.

## User Transactions reference
The possible user transactions are:
- revealRandomWordsAndElectWinners
- distributeErc20Prizes
- distributeNativePrizes
- distributeErc721Prizes

Details are presented below:

### revealRandomWordsAndElectWinners
The __revealRandomWordsAndElectWinners__ action takes 3 argument as input:
- drawId_: bytes32, The draw's unique identifier
- userRandom: bytes32, The user's random number that produced the commitment hash
- providerRandom: bytes32, The provider's random number

Reverts:
- AE: If random number already revealed for given drawId
- NVS: If caller is not the creator

Emits:
- RequestFulfilled
- RoundWinner

Calculates the secret number and then elects the winners for the given drawId


### distributeErc20Prizes
The __distributeErc20Prizes__ action takes 5 argument as input:
- drawId_: bytes32, The draw's unique identifier
- proof: bytes32[], The merkle proofs for the winningAddresses and Ids
- winningAddresses: address[], The winning addresses in the same way as the produced from the MerkleTree library for the given proofs
- winnerIds: uint256[], The winning ids in the same way as they produced from the MerkleTree library for the given proofs
- flags: bool[], The path for the given proofs and leafs to be validated

Reverts:
- NVS: If sender is not the creator of the draw
- AD: If given drawId has already been distributed
- NVR: If secret number has not yet revealed
- NVTY: If the draw id not of type ERC20
- NVL: If winnerAddresses and winnerIds length not matching numOfTotalWinners
- NVPRO: If not valid proofs for given ids and addresses
- TransferFromFailed(): If the transfer of the tokens fail for some reason, or the provided addresses/ids not matching actual winners

Emits:
- DrawCompleted

Aidrops the ERC20 token to winners 

### distributeNativePrizes
The __distributeNativePrizes__ action takes 5 argument as input:
- drawId_: bytes32, The draw's unique identifier
- proof: bytes32[], The merkle proofs for the winningAddresses and Ids
- winningAddresses: address[], The winning addresses in the same way as the produced from the MerkleTree library for the given proofs
- winnerIds: uint256[], The winning ids in the same way as they produced from the MerkleTree library for the given proofs
- flags: bool[], The path for the given proofs and leafs to be validated

Reverts:
- NVS: If sender is not the creator of the draw
- AD: If given drawId has already been distributed
- NVR: If secret number has not yet revealed
- NVTY: If the draw id not of type ERC20
- NVL: If winnerAddresses and winnerIds length not matching numOfTotalWinners
- NVV: If msg.value is not equal the amountPerWinner*numOfWinners
- NVP: If not valid proofs for given ids and addresses
- TransferFromFailed(): If the transfer of the tokens fail for some reason, or the provided addresses/ids not matching actual winners

Emits:
- DrawCompleted

Aidrops the native currency to winners 

### distributeErc721Prizes
The __distributeErc721Prizes__ action takes 6 argument as input:
- drawId_: bytes32, The draw's unique identifier
- proof: bytes32[], The merkle proofs for the winningAddresses and Ids
- winningAddresses: address[], The winning addresses in the same way as the produced from the MerkleTree library for the given proofs
- winnerIds: uint256[], The winning ids in the same way as they produced from the MerkleTree library for the given proofs
- flags: bool[], The path for the given proofs and leafs to be validated
- erc721Ids: uint256[] 

Reverts:
- NVS: If sender is not the creator of the draw
- NVT: If given tokenIds not matching the provided tokenIds on drawCreation
- AD: If given drawId has already been distributed
- NVR: If secret number has not yet revealed
- NVTY: If the draw id not of type ERC20
- NVL: If winnerAddresses and winnerIds length not matching numOfTotalWinners
- NVP: If not valid proofs for given ids and addresses
- TransferFromFailed(): If the transfer of the tokens fail for some reason, or the provided addresses/ids not matching actual winners

Emits:
- DrawCompleted

Aidrops the ERC721 token to winners 

## Restricted action Transactions reference
These transactions can only be called by the registry:
- createNewErc20Draw
- createNewNativeDraw
- createNewErc721Draw

### createNewErc20Draw
The __createNewErc20Draw__ action takes 8 argument as input:
- drawId_: bytes32, The unique identifier of the draw
- operator: address, The draw's creator
- erc20Token: address, The address of the token to airdrop
- rootHash: bytes32, The merkle tree's root for the given participants
- numOfWinners: uint256, The total number of winners
- numOfParticipants: uint256, The total number of participants
- winningAmountPerUser: uint256, The amount each winner will get
- commitment: bytes32, The keccak256 hash of user's random number

Reverts:
- NVS: If caller is not the registry

Emits:
- DrawInitiated
- RequestSent

Initialises a draw for a given drawId and send a request to pyth's VRF 

### createNewNativeDraw
The __createNewNativeDraw__ action takes 7 argument as input:
- drawId_: bytes32, The unique identifier of the draw
- operator: address, The draw's creator
- rootHash: bytes32, The merkle tree's root for the given participants
- numOfWinners: uint256, The total number of winners
- numOfParticipants: uint256, The total number of participants
- winningAmountPerUser: uint256, The amount each winner will get
- commitment: bytes32, The keccak256 hash of user's random number

Reverts:
- NVS: If caller is not the registry

Emits:
- DrawInitiated
- RequestSent

Initialises a draw for a given drawId and send a request to pyth's VRF 

### createNewErc721Draw
The __createNewErc721Draw__ action takes 7 argument as input:
- drawId_: bytes32, The unique identifier of the draw
- operator: address, The draw's creator
- erc721Token: address, The address of the token to airdrop
- rootHash: bytes32, The merkle tree's root for the given participants
- numOfWinners: uint256, The total number of winners
- numOfParticipants: uint256, The total number of participants
- erc721Ids: uint256[], The tokenIds to airdrop to each winner
- commitment: bytes32, The keccak256 hash of user's random number

Reverts:
- NVS: If caller is not the registry

Emits:
- DrawInitiated
- RequestSent

Initialises a draw for a given drawId and send a request to pyth's VRF 

## Internal transactions reference
- _requestRandomWords
- _electWinnersForDrawId
- _verify
- _cacheMemoryAndPerformMultiERC20TransferCustom
- _performNativeCustom
- _performMultiERC721Transfer

Details are presented below:

### _requestRandomWords
The ___requestRandomWords__ action takes 3 argument as input:
- drawId_: bytes32
- commitment: bytes32
- fee: uint256

Emits:
- RequestSent

Asks for a VRF to pyth's entropy contract and stores the sequenceNumber for the given request

### _electWinnersForDrawId
The ___electWinnersForDrawId__ action takes 2 argument as input:
- drawId_: bytes32
- vrfResponse: uint256

Emits:
- RoundWinner

Runs a loop numOfWinnersTimes, each round it elects a proposeId with vrfResponse%(totalParticipants-round) + 1 since 0 is not a valid id
then checks if the proposeId has already been elected, if not then stores the proposeId at the round's position and swaps his position with the current length of totalParticipant,
If the proposeId has been elected then it checks whats the new id on this position, it keeps on checking till it finds an id that has not won, after it finds it, it stores its winning position and store swaps his position
with the current length of totalParticipant. For example:

    VrfResponse = 194619047104
    NumOfWinners = 5
    NumOfParticipant = 10
    proposeId = (VrfResponse%NumOfParticipant)+1
    possibleId = mapping(proposeId => actualId)

    Round 1:
        NumOfParticipant = 10
        Round 1 proposeId: 5
        possibleId[5] = 0 so 5 is valid
        New Id for 5 = 10
        possibleId[5] = 10
    
    Round 2:
        NumOfParticipant = 9
        Round 2 proposeId = 2
        possibleId[2] = 0 so 2 is valid
        New Id for 2 = 9
        possibleId[2] = 9
    
    Round 3:
        NumOfParticipant = 8
        Round 3 proposeId = 1
        possibleId[1] = 0 so 1 is valid
        New Id for 1 = 8
        possibleId[1] = 8
    
    Round 4:
        NumOfParticipant = 7
        Round 4 proposeId = 7
        possibleId[7] = 0 so 7 is valid
        New id for 7 = 7
        possibleId[7] = 7
    
    Round 5:
        NumOfParticipant = 6
        Round 5 proposeId = 5
        possibleId[5] = 10 so 5 is not valid
        possibleId[10] = 0 so 10 is valid
        proposeId = 10
        possibleId[5] = 6
   
    finalWinners = [5,2,1,7,10]

### _verify
The ___verify__ action takes 5 argument as input:
- drawId: bytes32, The draws unique identifier
- proof: bytes32[], The merkle proofs produced by the MerkleTree lib for the given winners and uids
- winners: address[], The winner addresses that used in the proofs, must be in the same order as given by the MerkleTree lib
- uids: uint256[], The winner ids that used in the proofs, must be in the same order as given by the MerkleTree lib
- flags: bool[], The path fot the verification of the proofs

Reverts:
- NVP: If given proofs are not valid

Encoded the leafs from the winners and uids and then verifies the proofs

### _cacheMemoryAndPerformMultiERC20TransferCustom
The ___cacheMemoryAndPerformMultiERC20TransferCustom__ action takes 6 argument as input:
- token: address, The token address to be airdroped
- recipients: address[], The recipients addresses
- winnerIds: uint256[], The recipients ids, must be a valid winner
- winningAmount: uint256, The amount to airdrop
- drawId: bytes32, The draws unique identifier
- slot: uint256, The storage slot to retrieve the mapping hash of winnerIds

Reverts:
- TransferFromFailed(): If the transfer of the tokens fail for some reason, or the provided addresses/ids not matching actual winners

For each recipient it checks that the given id is a valid winner and airdrops the erc20 amount

### _performMultiERC721Transfer
The ___performMultiERC721Transfer__ action takes 6 argument as input:
- token: address, The token address to be airdroped
- recipients: address[], The recipients addresses
- winnerIds: uint256[], The recipients ids, must be a valid winner
- erc721Ids: uint256[], The tokenIds to airdrop
- drawId: bytes32, The draws unique identifier
- slot: uint256, The storage slot to retrieve the mapping hash of winnerIds

Reverts:
- TransferFromFailed(): If the transfer of the tokens fail for some reason, or the provided addresses/ids not matching actual winners

For each recipient it checks that the given id is a valid winner and airdrops the erc721 token id

### _performNativeCustom
The ___performNativeCustom__ action takes 5 argument as input:
- recipients: address[], The recipients addresses
- winnerIds: uint256[], The recipients ids, must be a valid winner
- winningAmount: uint256, The amount to airdrop
- drawId: bytes32, The draws unique identifier
- slot: uint256, The storage slot to retrieve the mapping hash of winnerIds

Reverts:
- TransferFromFailed(): If the provided addresses/ids not matching actual winners

For each recipient it checks that the given id is a valid winner and airdrops the native amount


## Events:
    event DrawInitiated(bytes32 indexed DrawId);
    event RoundWinner(bytes32 indexed DrawId, uint256 indexed Round, uint256 Id);
    event DrawCompleted(bytes32 indexed DrawId);
    event RequestSent(bytes32 indexed DrawId, uint64 indexed RequestId);
    event RequestFulfilled(bytes32 indexed DrawId, uint64 indexed RequestId, uint256 Response);

## View transactions:
- getDistributionBlock
- getRequestIdForDrawId
- getRequestResponse
- getDrawStatus
- getProviderInfo
- getProviderInfoAndSequenceNumber


### getDistributionBlock():
Returns the given drawId's distribution block

### getRequestIdForDrawId():
Returns the given drawId's VRF requestId

### getRequestResponse():
Returns the given drawId's VRF response

### getDrawStatus():
The ___getDrawStatus__ action takes 1 argument as input:
- drawId_ : bytes32

Returns the currents draw's status  

### getProviderInfo():
The __getProviderInfo__ action takes 0 argument as input

External view function that returns the current's providers uri 

### getProviderInfoAndSequenceNumber():
The __getProviderInfoAndSequenceNumber__ action takes 1 argument as input:
- drawId_ : bytes32

External view function that returns the current's providers uri and sequence number for givenDrawId
