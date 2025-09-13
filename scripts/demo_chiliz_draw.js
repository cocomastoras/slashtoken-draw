const { ethers} = require("ethers");
var Web3 = require('web3');

const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require('fs').promises;

//Network config
const drawAbi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "entropy",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "TransferFromFailed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "Operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "BundlesAmounts",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "BundlesPrices",
          "type": "uint256[]"
        }
      ],
      "name": "BundlesUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "DrawId",
          "type": "bytes32"
        }
      ],
      "name": "DrawCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "DrawId",
          "type": "bytes32"
        }
      ],
      "name": "DrawInitiated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "DrawId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint64",
          "name": "RequestId",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Response",
          "type": "uint256"
        }
      ],
      "name": "RequestFulfilled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "DrawId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint64",
          "name": "RequestId",
          "type": "uint64"
        }
      ],
      "name": "RequestSent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "DrawId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "Round",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Id",
          "type": "uint256"
        }
      ],
      "name": "RoundWinner",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address[]",
          "name": "Wallet",
          "type": "address[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "Txns",
          "type": "uint256[]"
        }
      ],
      "name": "TxnsAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "Buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "Txns",
          "type": "uint256"
        }
      ],
      "name": "TxnsBundleBought",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "Wallet",
          "type": "address"
        }
      ],
      "name": "WalletBaseFeeReset",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "Wallet",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "BaseFeeInWei",
          "type": "uint256"
        }
      ],
      "name": "WalletBaseFeeSet",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "list",
          "type": "address[]"
        }
      ],
      "name": "addToDenylist",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "wallets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "txns",
          "type": "uint256[]"
        }
      ],
      "name": "addTxnsToWallets",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "baseFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "bundleIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "buyTxnsBundle",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "calculateVRFCost",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "feeRequired",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "erc20Token",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "rootHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "numOfWinners",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "numOfParticipants",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "winningAmountPerUser",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "commitment",
          "type": "bytes32"
        }
      ],
      "name": "createNewErc20Draw",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "erc721Token",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "rootHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "numOfWinners",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "numOfParticipants",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "erc721Ids",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes32",
          "name": "commitment",
          "type": "bytes32"
        }
      ],
      "name": "createNewErc721Draw",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "rootHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "numOfWinners",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "numOfParticipants",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "winningAmountPerUser",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "commitment",
          "type": "bytes32"
        }
      ],
      "name": "createNewNativeDraw",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32[]",
          "name": "proof",
          "type": "bytes32[]"
        },
        {
          "internalType": "address[]",
          "name": "winnerAddresses",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "winnerIds",
          "type": "uint256[]"
        },
        {
          "internalType": "bool[]",
          "name": "flags",
          "type": "bool[]"
        }
      ],
      "name": "distributeErc20Prizes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32[]",
          "name": "proof",
          "type": "bytes32[]"
        },
        {
          "internalType": "address[]",
          "name": "winnerAddresses",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "winnerIds",
          "type": "uint256[]"
        },
        {
          "internalType": "bool[]",
          "name": "flags",
          "type": "bool[]"
        },
        {
          "internalType": "uint256[]",
          "name": "erc721Ids",
          "type": "uint256[]"
        }
      ],
      "name": "distributeErc721Prizes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32[]",
          "name": "proof",
          "type": "bytes32[]"
        },
        {
          "internalType": "address[]",
          "name": "winnerAddresses",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "winnerIds",
          "type": "uint256[]"
        },
        {
          "internalType": "bool[]",
          "name": "flags",
          "type": "bool[]"
        }
      ],
      "name": "distributeNativePrizes",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "drawIdToRootHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "value_",
          "type": "uint256"
        }
      ],
      "name": "freezeContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "frozen",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAvailableTxnsForWallet",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBaseFeeForWallet",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBundles",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "AvailableBundles",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "BundlesPrices",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getDenylist",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        }
      ],
      "name": "getDistributionBlock",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        }
      ],
      "name": "getDrawStatus",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getProviderInfo",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        }
      ],
      "name": "getProviderInfoAndSequenceNumber",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        },
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        }
      ],
      "name": "getRequestIdForDrawId",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        }
      ],
      "name": "getRequestResponse",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getUserDrawIds",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getUsersThatBoughtBundles",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "Users",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "admin_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "feeSink_",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "baseFeeCostInWei",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "availableTxnsBundles_",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "txnsBundlesToPrice_",
          "type": "uint256[]"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "list",
          "type": "address[]"
        }
      ],
      "name": "removeFromDenylist",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        }
      ],
      "name": "resetBaseFeeForWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "userRandom",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "providerRandom",
          "type": "bytes32"
        }
      ],
      "name": "revealRandomWordsAndElectWinners",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amountInWei",
          "type": "uint256"
        }
      ],
      "name": "setBaseFeeForWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "baseFee_",
          "type": "uint256"
        }
      ],
      "name": "setNewBaseFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "availableTxnsBundles_",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "txnsBundlesToPrice_",
          "type": "uint256[]"
        }
      ],
      "name": "updateBundles",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "feeSink_",
          "type": "address"
        }
      ],
      "name": "updateFeeSink",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userToTxns",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

const spiceRPC = 'https://spicy-rpc.chiliz.com'
const contract_address_testnet = '0x99F5603877C915c957AdE5527DEf51E6820086A6'
const entropy_address = '0xD458261E832415CFd3BAE5E416FdF3230ce6F134'

const spicyProvider = new ethers.JsonRpcProvider(spiceRPC)
const pk = ''
const spicysigner = new ethers.Wallet(pk, spicyProvider)
const spicyContract = new ethers.Contract(contract_address_testnet, drawAbi, spicysigner)

//Merkle config
const values = []
const totalParticipants = 77n;
const totalWinners = 1;
const winnerIds = []
const winnerAddresses = []
let treeProof = []
let treeProofFlags = []

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
        let data = await fs.readFile('../addresses_file_1.json', 'utf8');
        data = JSON.parse(data);
        for(let i=0; i< totalParticipants;i++){
            values.push([i+1, data[i+1]])
        }
    } catch (error) {
        throw error;
    }
}
async function createNewNativeDraw(){
    await readAndParseFile()
    const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
    const root = tree.root
    const drawId = Web3.utils.randomHex(32)
    console.log("DrawId: ", drawId)
    const userRandomNumber = Web3.utils.randomHex(32)
    console.log("User random number: ", userRandomNumber)
    const commitment = Web3.utils.keccak256(userRandomNumber);
    const baseFee = await spicyContract.baseFee()
    const serviceFee = await spicyContract.calculateVRFCost()
    const signer = spicyContract.connect(spicysigner);
    const tx = await signer.createNewNativeDraw(drawId, root, totalWinners, totalParticipants, 100000, commitment, {value: baseFee + serviceFee})
    await tx.wait()
}

async function electWinners() {
    const vrfResp = '0x10a15b530055ba7957343153ed3a1c4c300dc5286314595661a3be3e00bf0462'
    const userRandom = '0xa3e170ccd80755cf481e09d2da98ecfb45f1308fcabd6a19874c53b6b59f237a'
    const drawId = '0xa6e0249f8c5bfadda6497cb2344fad27003a6646bdf4e50e0ea537e889af6ba0'
    const signer = spicyContract.connect(spicysigner);
    const tx = await signer.revealRandomWordsAndElectWinners(drawId, userRandom, vrfResp)
    await tx.wait()
}

// DrawId:  0xa6e0249f8c5bfadda6497cb2344fad27003a6646bdf4e50e0ea537e889af6ba0
// User random number:  0xa3e170ccd80755cf481e09d2da98ecfb45f1308fcabd6a19874c53b6b59f237a

async function distributeNative(drawId){
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
// createNewNativeDraw()
electWinners()
