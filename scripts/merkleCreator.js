const { ethers} = require("ethers");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require('fs').promises;

//Network config
const sepoliaAddress = '0xd7BED525abdAE5B75638b47F5d10c874a85A3487'
const opAddress = '0xc1aaB5D3F4e19c5B377080b525156eB22623a5e1'
const linkAddress = '0x779877A7B0D9E8603169DdbD7836e478b4624789'
const sepoliaAbi = [{"inputs":[{"internalType":"address","name":"vrfCoordinator","type":"address"},{"internalType":"address","name":"_endpoint","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"InvalidEndpointCall","type":"error"},{"inputs":[],"name":"LzTokenUnavailable","type":"error"},{"inputs":[{"internalType":"uint32","name":"eid","type":"uint32"}],"name":"NoPeer","type":"error"},{"inputs":[{"internalType":"uint256","name":"msgValue","type":"uint256"}],"name":"NotEnoughNative","type":"error"},{"inputs":[{"internalType":"address","name":"have","type":"address"},{"internalType":"address","name":"want","type":"address"}],"name":"OnlyCoordinatorCanFulfill","type":"error"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"OnlyEndpoint","type":"error"},{"inputs":[{"internalType":"uint32","name":"eid","type":"uint32"},{"internalType":"bytes32","name":"sender","type":"bytes32"}],"name":"OnlyPeer","type":"error"},{"inputs":[],"name":"TransferFromFailed","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"DrawId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"LastId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"NewId","type":"uint256"}],"name":"NewIdGiven","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint32","name":"eid","type":"uint32"},{"indexed":false,"internalType":"bytes32","name":"peer","type":"bytes32"}],"name":"PeerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"RequestId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"Response","type":"uint256"}],"name":"RequestFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"RequestId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"NumOfWords","type":"uint256"}],"name":"RequestSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"DrawId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"Round","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"Id","type":"uint256"}],"name":"RoundWinner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"Slot","type":"uint256"}],"name":"Slot","type":"event"},{"inputs":[{"components":[{"internalType":"uint32","name":"srcEid","type":"uint32"},{"internalType":"bytes32","name":"sender","type":"bytes32"},{"internalType":"uint64","name":"nonce","type":"uint64"}],"internalType":"struct Origin","name":"origin","type":"tuple"}],"name":"allowInitializePath","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint128","name":"_gas","type":"uint128"},{"internalType":"uint128","name":"_value","type":"uint128"}],"name":"constructOption","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"erc20Token","type":"address"},{"internalType":"bytes32","name":"rootHash","type":"bytes32"},{"internalType":"uint256","name":"numOfWinners","type":"uint256"},{"internalType":"uint256","name":"numOfParticipants","type":"uint256"},{"internalType":"uint256","name":"winningAmountPerUser","type":"uint256"}],"name":"createNewErc20Draw","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"},{"internalType":"bytes","name":"_options","type":"bytes"},{"internalType":"bytes","name":"_dstChainOptions","type":"bytes"},{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"},{"internalType":"address[]","name":"winnerAddresses","type":"address[]"},{"internalType":"uint256[]","name":"winnerIds","type":"uint256[]"},{"internalType":"bool[]","name":"flags","type":"bool[]"}],"name":"distributeErc20Prizes","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"drawIdToRootHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"endpoint","outputs":[{"internalType":"contract ILayerZeroEndpointV2","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"},{"internalType":"bytes","name":"_options","type":"bytes"},{"internalType":"bytes","name":"_dstChainOptions","type":"bytes"},{"internalType":"address[]","name":"winnerAddresses","type":"address[]"},{"internalType":"uint256[]","name":"winnerIds","type":"uint256[]"}],"name":"estimateFees","outputs":[{"internalType":"uint256","name":"nativeFee","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"}],"name":"getRequestIdForDrawId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"}],"name":"getRequestResponse","outputs":[{"internalType":"uint256","name":"rsp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"srcEid","type":"uint32"},{"internalType":"bytes32","name":"sender","type":"bytes32"},{"internalType":"uint64","name":"nonce","type":"uint64"}],"internalType":"struct Origin","name":"_origin","type":"tuple"},{"internalType":"bytes32","name":"_guid","type":"bytes32"},{"internalType":"bytes","name":"_message","type":"bytes"},{"internalType":"address","name":"_executor","type":"address"},{"internalType":"bytes","name":"_extraData","type":"bytes"}],"name":"lzReceive","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint32","name":"","type":"uint32"},{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"nextNonce","outputs":[{"internalType":"uint64","name":"nonce","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oAppVersion","outputs":[{"internalType":"uint64","name":"senderVersion","type":"uint64"},{"internalType":"uint64","name":"receiverVersion","type":"uint64"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32","name":"eid","type":"uint32"}],"name":"peers","outputs":[{"internalType":"bytes32","name":"peer","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"requestId","type":"uint256"},{"internalType":"uint256[]","name":"randomWords","type":"uint256[]"}],"name":"rawFulfillRandomWords","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_delegate","type":"address"}],"name":"setDelegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"_eid","type":"uint32"},{"internalType":"bytes32","name":"_peer","type":"bytes32"}],"name":"setPeer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
const opAbi = [{"inputs":[{"internalType":"address","name":"_endpoint","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"InvalidEndpointCall","type":"error"},{"inputs":[],"name":"LzTokenUnavailable","type":"error"},{"inputs":[{"internalType":"uint32","name":"eid","type":"uint32"}],"name":"NoPeer","type":"error"},{"inputs":[{"internalType":"uint256","name":"msgValue","type":"uint256"}],"name":"NotEnoughNative","type":"error"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"OnlyEndpoint","type":"error"},{"inputs":[{"internalType":"uint32","name":"eid","type":"uint32"},{"internalType":"bytes32","name":"sender","type":"bytes32"}],"name":"OnlyPeer","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"DrawId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"LastId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"NewId","type":"uint256"}],"name":"NewIdGiven","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint32","name":"eid","type":"uint32"},{"indexed":false,"internalType":"bytes32","name":"peer","type":"bytes32"}],"name":"PeerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"DrawId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"Round","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"Id","type":"uint256"}],"name":"RoundWinner","type":"event"},{"inputs":[{"components":[{"internalType":"uint32","name":"srcEid","type":"uint32"},{"internalType":"bytes32","name":"sender","type":"bytes32"},{"internalType":"uint64","name":"nonce","type":"uint64"}],"internalType":"struct Origin","name":"origin","type":"tuple"}],"name":"allowInitializePath","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint128","name":"_gas","type":"uint128"}],"name":"constructOption","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"endpoint","outputs":[{"internalType":"contract ILayerZeroEndpointV2","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"},{"internalType":"bytes","name":"_options","type":"bytes"},{"internalType":"address[]","name":"winnerAddresses","type":"address[]"}],"name":"estimateFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint32","name":"srcEid","type":"uint32"},{"internalType":"bytes32","name":"sender","type":"bytes32"},{"internalType":"uint64","name":"nonce","type":"uint64"}],"internalType":"struct Origin","name":"_origin","type":"tuple"},{"internalType":"bytes32","name":"_guid","type":"bytes32"},{"internalType":"bytes","name":"_message","type":"bytes"},{"internalType":"address","name":"_executor","type":"address"},{"internalType":"bytes","name":"_extraData","type":"bytes"}],"name":"lzReceive","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint32","name":"","type":"uint32"},{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"nextNonce","outputs":[{"internalType":"uint64","name":"nonce","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oAppVersion","outputs":[{"internalType":"uint64","name":"senderVersion","type":"uint64"},{"internalType":"uint64","name":"receiverVersion","type":"uint64"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32","name":"eid","type":"uint32"}],"name":"peers","outputs":[{"internalType":"bytes32","name":"peer","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"retrieve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_delegate","type":"address"}],"name":"setDelegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"_eid","type":"uint32"},{"internalType":"bytes32","name":"_peer","type":"bytes32"}],"name":"setPeer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
const sepoliaRPC = 'https://eth-sepolia-public.unifra.io'
const opRPC = 'https://sepolia.optimism.io'
const opProvider = new ethers.JsonRpcProvider(opRPC)
const sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRPC)
const pk = ''
const sepoliaSigner = new ethers.Wallet(pk, sepoliaProvider)
const opSigner = new ethers.Wallet(pk, opProvider)
const sepoliaContract = new ethers.Contract(sepoliaAddress, sepoliaAbi, sepoliaSigner)
const opContract = new ethers.Contract(opAddress, opAbi, opSigner)

//Merkle config
const values = []
const totalParticipants = 100000n;
const totalWinners = 100;
const winnerIds = []
const winnerAddresses = []
let treeProof = []
let treeProofFlags = []
let opOptions;
let opNativeFee;
let sepOptions;
let sepNativeFee;
function getWinners(vrf, tree){
    const winners = []
    const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
    for (let i =0; i<totalWinners;i++){
        const winnerId = (vrf%(totalParticipants - BigInt(i))) + 1n
        if(dict[winnerId] === 0) {
            winners.push(winnerId)
        } else {
            let temp = dict[winnerId]
            while (dict[temp] !== 0) {
                temp = dict[temp]
            }
            winners.push(temp)
        }
        dict[winnerId] = totalParticipants - BigInt(i)
    }
    // console.log(winners)
    const entries = []
    for (let i =0; i<totalWinners;i++){
        entries.push(values[winners[i] - 1n])
    }
    const {proof, leaves, proofFlags} = tree.getMultiProof(entries)
    treeProof = proof
    treeProofFlags = proofFlags
    for (let i =0; i<totalWinners;i++){
        winnerIds.push(leaves[i][0])
        winnerAddresses.push(leaves[i][1])
    }
}
async function readAndParseFile() {
    try {
        let data = await fs.readFile('../addresses_file_3.json', 'utf8');
        data = JSON.parse(data);
        for(let i=0; i< totalParticipants;i++){
            values.push([i+1, data[400000+i+1]])
        }
    } catch (error) {
        throw error;
    }
}
async function createNewErc20Drop(){
    await readAndParseFile()
    const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
    const root = tree.root
    const signer = sepoliaContract.connect(sepoliaSigner);
    const tx = await signer.createNewErc20Draw(linkAddress, root, totalWinners, totalParticipants, 100000)
    await tx.wait()
}
async function getVrfResponse(drawId){
    const signer = sepoliaContract.connect(sepoliaSigner);
    return await signer.getRequestResponse(drawId)
}
async function sepoliaEstimateFees(drawId, destOptions, nativeFee){
    const signer = sepoliaContract.connect(sepoliaSigner);
    const len = winnerAddresses.length
    sepOptions = await signer.constructOption(150000+(65000*len), nativeFee)
    sepNativeFee = await signer.estimateFees(drawId, sepOptions, destOptions, winnerAddresses, winnerIds)
}
async function opEstimateFees(drawId){
    const signer = opContract.connect(opSigner);
    const len = winnerAddresses.length
    opOptions = await signer.constructOption(100000 + (50000*len))
    opNativeFee = await signer.estimateFees(drawId, opOptions, winnerAddresses)
}
async function distributeErc20(drawId){
    const signer = sepoliaContract.connect(sepoliaSigner);
    const vrf = await getVrfResponse(drawId)
    await readAndParseFile()
    const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
    getWinners(vrf, tree)
    await opEstimateFees(drawId)
    await sepoliaEstimateFees(drawId, opOptions, opNativeFee)
    const txn = await signer.distributeErc20Prizes(drawId, sepOptions, opOptions, treeProof, winnerAddresses, winnerIds, treeProofFlags, {value: sepNativeFee*11n/10n})
    await txn.wait()
}

// createNewErc20Drop()
// distributeErc20(38)


