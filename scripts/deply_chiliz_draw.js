const { ethers} = require("ethers");
var Web3 = require('web3');

const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require('fs').promises;

//Network config
const registryAbi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
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
          "indexed": false,
          "internalType": "uint256",
          "name": "SF",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "OF",
          "type": "uint256"
        }
      ],
      "name": "Claimed",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "network",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "gasPrice",
          "type": "uint256"
        }
      ],
      "name": "calculateVRFCost",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "nativeRequired",
          "type": "uint256"
        },
        {
          "internalType": "int256",
          "name": "statusCode",
          "type": "int256"
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
        }
      ],
      "name": "createNewErc20DrawChainlink",
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
      "name": "createNewErc20DrawPyth",
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
          "name": "erc721TokenIds",
          "type": "uint256[]"
        }
      ],
      "name": "createNewErc721DrawChainlink",
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
          "name": "erc721TokenIds",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes32",
          "name": "commitment",
          "type": "bytes32"
        }
      ],
      "name": "createNewErc721DrawPyth",
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
        }
      ],
      "name": "createNewNativeDrawChainlink",
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
      "name": "createNewNativeDrawPyth",
      "outputs": [],
      "stateMutability": "payable",
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
      "name": "getInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
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
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserDrawIds",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "drawIds",
          "type": "bytes32[]"
        },
        {
          "internalType": "uint256[]",
          "name": "network",
          "type": "uint256[]"
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
          "internalType": "address",
          "name": "chainlink_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "pyth_",
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
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "priceFeed",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "vrfCoordinator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "entropyProvider",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "multiplier",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "divisor",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "gasLimit",
              "type": "uint256"
            },
            {
              "internalType": "uint64",
              "name": "subscriptionId",
              "type": "uint64"
            }
          ],
          "internalType": "struct PriceFeedInitiator",
          "name": "priceFeedInitiator_",
          "type": "tuple"
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
          "name": "chainlinkDraw_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "pythDraw_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "entropyAddress_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "providerAddress_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "coordinatorAddress_",
          "type": "address"
        },
        {
          "internalType": "uint64",
          "name": "subId_",
          "type": "uint64"
        },
        {
          "internalType": "address",
          "name": "priceFeedAddress_",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "multiplier_",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "divisor_",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "gasLimit_",
          "type": "uint256"
        }
      ],
      "name": "updateConfigs",
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
          "internalType": "uint256",
          "name": "lowSlippage_",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "highSlippage_",
          "type": "uint256"
        }
      ],
      "name": "updateSlippage",
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
const pythAbi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "entropy",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "registry_",
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
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "drawId_",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
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
        },
        {
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
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
          "name": "operator",
          "type": "address"
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
          "internalType": "bytes32",
          "name": "erc721IdsHash",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "commitment",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
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
          "internalType": "address",
          "name": "operator",
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
        },
        {
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
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
    }
  ]
const spiceRPC = 'https://spicy-rpc.chiliz.com'
const entropy_address = '0xD458261E832415CFd3BAE5E416FdF3230ce6F134'

const pythAddress = '0x12837F7F893774E46dE026dAfd12528602A33838'
const registryAddress = '0x8c19973c03f4ef5b2529d04d1dbfbb815db5a2c3'


const spicyProvider = new ethers.JsonRpcProvider(spiceRPC)
const pk = 'aca56c51b762ab87ab4f24c9e3ee13b1b72de2d05473c9e2b97690bc798b2710'
const spicysigner = new ethers.Wallet(pk, spicyProvider)

const registryBytecode = '0x6080604052600980546001600160a01b031916736cc14824ea2918f5de5c2f75a9da968ad4bd63441790556001600a819055600b5534801561004057600080fd5b50615e4580620000516000396000f3fe60806040526004361061024f5760003560e01c80636ef25c3a11610138578063a085f60c116100b0578063d294f0931161007f578063e85ddb8a11610064578063e85ddb8a14610632578063fe70099014610652578063feda8a871461067257600080fd5b8063d294f093146105f0578063d993cdff1461060557600080fd5b8063a085f60c1461057c578063b079d0181461058f578063b0dd5ec6146105a2578063b11011c0146105d057600080fd5b806388f941e8116101075780638c00ca9d116100ec5780638c00ca9d1461053457806393f9e6f91461055457806394ada3b01461056957600080fd5b806388f941e8146105015780638a6ff4561461051457600080fd5b80636ef25c3a146104895780637850953d1461049f578063798ed83d146104c15780637db39b45146104e157600080fd5b806333f740a1116101cb578063541e15bf1161019a5780635cec78eb1161017f5780635cec78eb1461043657806362274c2b146104565780636b7ff3b31461047657600080fd5b8063541e15bf1461040e5780635a9b0b891461042157600080fd5b806333f740a11461038c57806334ae8e38146103ac57806347ec4ed1146103cc57806352582ec8146103ee57600080fd5b806320a690c511610222578063244bd96711610207578063244bd9671461033757806327e8ed6314610359578063286ddb681461036c57600080fd5b806320a690c5146102e057806322f10e2f1461031557600080fd5b80630268cf9114610254578063054f7d9c1461028757806313a31cbb1461029d57806320a225cb146102bd575b600080fd5b34801561026057600080fd5b5061027461026f36600461513d565b6106a0565b6040519081526020015b60405180910390f35b34801561029357600080fd5b50610274600e5481565b3480156102a957600080fd5b506102746102b836600461513d565b610821565b3480156102c957600080fd5b506102d2610908565b60405161027e929190615192565b3480156102ec57600080fd5b506103006102fb3660046151c0565b6109b5565b6040805192835260208301919091520161027e565b34801561032157600080fd5b5061033561033036600461513d565b610c8e565b005b34801561034357600080fd5b5033600090815260186020526040902054610274565b610335610367366004615318565b610d19565b34801561037857600080fd5b5061033561038736600461513d565b61139f565b34801561039857600080fd5b506103356103a7366004615398565b611425565b3480156103b857600080fd5b506103356103c73660046153c4565b611577565b3480156103d857600080fd5b5033600090815260176020526040902054610274565b3480156103fa57600080fd5b5061033561040936600461543e565b6116d3565b61033561041c3660046155bc565b6119ec565b34801561042d57600080fd5b50610300612098565b34801561044257600080fd5b5061027461045136600461513d565b6120b4565b34801561046257600080fd5b506103356104713660046155f7565b61219b565b610335610484366004615614565b61226d565b34801561049557600080fd5b50610274601c5481565b3480156104ab57600080fd5b506104b46129f3565b60405161027e91906156d0565b3480156104cd57600080fd5b506103356104dc36600461574b565b612a86565b3480156104ed57600080fd5b506102746104fc36600461513d565b612bca565b61033561050f3660046151c0565b612cb1565b34801561052057600080fd5b5061033561052f36600461574b565b612f26565b34801561054057600080fd5b5061033561054f3660046151c0565b61304e565b34801561056057600080fd5b506104b46130da565b610335610577366004615788565b613168565b61033561058a3660046157cb565b61377e565b61033561059d366004615824565b613d64565b3480156105ae57600080fd5b506105c26105bd3660046155f7565b6143e0565b60405161027e929190615874565b3480156105dc57600080fd5b506103356105eb3660046158cc565b614555565b3480156105fc57600080fd5b50610335614762565b34801561061157600080fd5b506102746106203660046155f7565b60186020526000908152604090205481565b34801561063e57600080fd5b5061033561064d366004615981565b6147f4565b34801561065e57600080fd5b5061033561066d3660046155f7565b61498e565b34801561067e57600080fd5b5061069261068d36600461513d565b614a56565b60405161027e9291906159dc565b60008181526020819052604081205473ffffffffffffffffffffffffffffffffffffffff166106ce81614b65565b15610773576040517f0268cf910000000000000000000000000000000000000000000000000000000081526004810184905273ffffffffffffffffffffffffffffffffffffffff821690630268cf9190602401602060405180830381865afa15801561073e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107629190615a3f565b67ffffffffffffffff169392505050565b61077c81614b78565b15610818576040517f0268cf910000000000000000000000000000000000000000000000000000000081526004810184905273ffffffffffffffffffffffffffffffffffffffff821690630268cf91906024015b602060405180830381865afa1580156107ed573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108119190615a5c565b9392505050565b50600092915050565b60008181526020819052604081205473ffffffffffffffffffffffffffffffffffffffff1661084f81614b65565b156108a7576040517f13a31cbb0000000000000000000000000000000000000000000000000000000081526004810184905273ffffffffffffffffffffffffffffffffffffffff8216906313a31cbb906024016107d0565b6108b081614b78565b15610818576040517f13a31cbb0000000000000000000000000000000000000000000000000000000081526004810184905273ffffffffffffffffffffffffffffffffffffffff8216906313a31cbb906024016107d0565b606080601980548060200260200160405190810160405280929190818152602001828054801561095757602002820191906000526020600020905b815481526020019060010190808311610943575b50505050509150601a8054806020026020016040519081016040528092919081815260200182805480156109aa57602002820191906000526020600020905b815481526020019060010190808311610996575b505050505090509091565b60008083600003610bdc576006546007546040517fa47c769600000000000000000000000000000000000000000000000000000000815274010000000000000000000000000000000000000000830467ffffffffffffffff16600482015273ffffffffffffffffffffffffffffffffffffffff92831692600092169063a47c769690602401600060405180830381865afa158015610a57573d6000803e3d6000fd5b505050506040513d6000823e601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0168201604052610a9d9190810190615a75565b505050905060008273ffffffffffffffffffffffffffffffffffffffff1663feaf968c6040518163ffffffff1660e01b815260040160a060405180830381865afa158015610aef573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b139190615b76565b5050600554600354600454848202819004620347d88d0281019b50949650670de0b6b3a764000088880204955065c38a96a0700083029094019391925090610b5f83633b9aca00615bf5565b8b1115610b8e577ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe9850610bcf565b838510610bab57866bffffffffffffffffffffffff169850610bcf565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff98505b5050505050505050610c87565b6008546009546040517fb88c914800000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff918216600482015291169063b88c914890602401602060405180830381865afa158015610c4e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c729190615c0c565b6fffffffffffffffffffffffffffffffff1691505b9250929050565b600c5473ffffffffffffffffffffffffffffffffffffffff163314610d14576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e5653000000000000000000000000000000000000000000000000000000000060448201526064015b60405180910390fd5b601c55565b600e5415610d83576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f43460000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b3360009081526010602052604090205415610dfa576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f55440000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b601b54600003610e66576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e495900000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b8315801590610e76575060648411155b8015610e825750828411155b610ee8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565700000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b8215801590610efa5750620186a08311155b610f60576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b60008781526020819052604090205473ffffffffffffffffffffffffffffffffffffffff1615610fec576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f44495500000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b600160008190526020527fcc69885fda6bcc1a4ace058b4a62bf5e179ea78fd58a1ccd71c22cc9b688792f5473ffffffffffffffffffffffffffffffffffffffff1680611097576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0b9060208082526004908201527f4e56505200000000000000000000000000000000000000000000000000000000604082015260600190565b60008881526020818152604080832080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff861617905533808452600283528184208054600181018255908552838520018c905583526017825280832054601890925282205490915060006111226001614b85565b905082156111305782611134565b601c545b925080600f60008282546111489190615c3e565b909155505060008290036111cd576111608184615c3e565b34146111c8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b611270565b803414611236576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b61127033600090815260186020526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff019055565b8373ffffffffffffffffffffffffffffffffffffffff1663fc230dd1828d338e8e8e8e8e6040516020016112a49190615c51565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529082905280516020909101207fffffffff0000000000000000000000000000000000000000000000000000000060e08b901b168252600482019790975273ffffffffffffffffffffffffffffffffffffffff95861660248201529490931660448501526064840191909152608483015260a482015260c481019190915260e481018990526101048101859052610124015b6000604051808303818588803b15801561137957600080fd5b505af115801561138d573d6000803e3d6000fd5b50505050505050505050505050505050565b600c5473ffffffffffffffffffffffffffffffffffffffff163314611420576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b600e55565b601c548110611490576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b600c5473ffffffffffffffffffffffffffffffffffffffff163314611511576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b73ffffffffffffffffffffffffffffffffffffffff821660008181526017602052604090819020839055517f44784c405393a593553ed0bf0ddb15aa2494ba9b97a8d75dfc9fabb7a64c8ce59061156b9084815260200190565b60405180910390a25050565b600c5473ffffffffffffffffffffffffffffffffffffffff1633146115f8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b8051825114611663576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e564400000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b81516116769060199060208501906150dd565b50805161168a90601a9060208401906150dd565b503373ffffffffffffffffffffffffffffffffffffffff167fed68a7a2289c86234d260dc96066680ff0bcde7d3376a219df515dde860435b1838360405161156b929190615192565b601b541561173d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f41490000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b81518351146117a8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e564400000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b600c805473ffffffffffffffffffffffffffffffffffffffff808b167fffffffffffffffffffffffff000000000000000000000000000000000000000092831617909255600d8054928a169290911691909117905582516118109060199060208601906150dd565b50815161182490601a9060208501906150dd565b506001601b819055601c85905560208190527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb49805473ffffffffffffffffffffffffffffffffffffffff8981167fffffffffffffffffffffffff0000000000000000000000000000000000000000928316179092556000929092527fcc69885fda6bcc1a4ace058b4a62bf5e179ea78fd58a1ccd71c22cc9b688792f8054918816919092168117909155156118e0576118de601386614ebf565b505b73ffffffffffffffffffffffffffffffffffffffff86161561190957611907601587614ebf565b505b8051602082015160408301516060840151608085015160a086015160c0870151600680546007805473ffffffffffffffffffffffffffffffffffffffff998a167fffffffffffffffffffffffff00000000000000000000000000000000000000009182161790915560088054988a16989091169790971790965560039490945560049290925560055567ffffffffffffffff1674010000000000000000000000000000000000000000027fffffffff0000000000000000000000000000000000000000000000000000000090921692909316919091171790555050505050505050565b3360009081526010602052604090205415611a63576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f55440000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b600e5415611acd576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f43460000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b601b54600003611b39576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e495900000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b8215801590611b49575060648311155b8015611b555750818311155b611bbb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565700000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b8115801590611bcd5750620186a08211155b611c33576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b60008581526020819052604090205473ffffffffffffffffffffffffffffffffffffffff1615611cbf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f44495500000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b6000805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb495473ffffffffffffffffffffffffffffffffffffffff1680611d69576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0b9060208082526004908201527f4e56505200000000000000000000000000000000000000000000000000000000604082015260600190565b60008681526020818152604080832080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff861617905533808452600283528184208054600181018255908552838520018a90558352601782528083205460189092528220549091506000611df46000614b85565b90508215611e025782611e06565b601c545b925080600f6000828254611e1a9190615c3e565b90915550506000829003611ef957611e33606482615c87565b600b54611e409190615bf5565b611e4a8285615c3e565b611e549190615cc2565b3410158015611e8e5750611e69606482615c87565b600a54611e769190615bf5565b611e808285615c3e565b611e8a9190615c3e565b3411155b611ef4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b611feb565b611f04606482615c87565b600b54611f119190615bf5565b611f1b9082615cc2565b3410158015611f4b5750611f30606482615c87565b600a54611f3d9190615bf5565b611f479082615c3e565b3411155b611fb1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b611feb33600090815260186020526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff019055565b6040517f9716a4e0000000000000000000000000000000000000000000000000000000008152600481018a905233602482015260448101899052606481018890526084810187905260a4810186905273ffffffffffffffffffffffffffffffffffffffff851690639716a4e09060c401600060405180830381600087803b15801561207557600080fd5b505af1158015612089573d6000803e3d6000fd5b50505050505050505050505050565b600080600f54476120a99190615cc2565b600f54915091509091565b60008181526020819052604081205473ffffffffffffffffffffffffffffffffffffffff166120e281614b65565b1561213a576040517f5cec78eb0000000000000000000000000000000000000000000000000000000081526004810184905273ffffffffffffffffffffffffffffffffffffffff821690635cec78eb906024016107d0565b61214381614b78565b15610818576040517f5cec78eb0000000000000000000000000000000000000000000000000000000081526004810184905273ffffffffffffffffffffffffffffffffffffffff821690635cec78eb906024016107d0565b600c5473ffffffffffffffffffffffffffffffffffffffff16331461221c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b73ffffffffffffffffffffffffffffffffffffffff8116600081815260176020526040808220829055517f9a93cb5054fe47b6e8ec0e29a26edd6249309d823eccab337b5c81dda65f6ddc9190a250565b600e54156122d7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f43460000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b336000908152601060205260409020541561234e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f55440000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b601b546000036123ba576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e495900000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b82158015906123ca575060648311155b80156123d65750818311155b61243c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565700000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b811580159061244e5750620186a08211155b6124b4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b8051831461251e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e564c00000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b60008681526020819052604090205473ffffffffffffffffffffffffffffffffffffffff16156125aa576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f44495500000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b6000805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb495473ffffffffffffffffffffffffffffffffffffffff1680612654576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0b9060208082526004908201527f4e56505200000000000000000000000000000000000000000000000000000000604082015260600190565b60008781526020818152604080832080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff861617905533808452600283528184208054600181018255908552838520018b905583526017825280832054601890925282205490915060006126df6000614b85565b905082156126ed57826126f1565b601c545b925080600f60008282546127059190615c3e565b909155505060008290036127e45761271e606482615c87565b600b5461272b9190615bf5565b6127358285615c3e565b61273f9190615cc2565b34101580156127795750612754606482615c87565b600a546127619190615bf5565b61276b8285615c3e565b6127759190615c3e565b3411155b6127df576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b6128d6565b6127ef606482615c87565b600b546127fc9190615bf5565b6128069082615cc2565b3410158015612836575061281b606482615c87565b600a546128289190615bf5565b6128329082615c3e565b3411155b61289c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b6128d633600090815260186020526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff019055565b8373ffffffffffffffffffffffffffffffffffffffff1663e0ab10238b338c8c8c8c8c6040516020016129099190615c51565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529082905280516020909101207fffffffff0000000000000000000000000000000000000000000000000000000060e08a901b168252600482019790975273ffffffffffffffffffffffffffffffffffffffff95861660248201529490931660448501526064840191909152608483015260a482015260c481019190915260e4015b600060405180830381600087803b1580156129cf57600080fd5b505af11580156129e3573d6000803e3d6000fd5b5050505050505050505050505050565b600c5460609073ffffffffffffffffffffffffffffffffffffffff163314612a77576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b612a81601d614ee1565b905090565b600c5473ffffffffffffffffffffffffffffffffffffffff163314612b07576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b805160005b81811015612bc557612b41838281518110612b2957612b29615cd5565b60200260200101516011614eee90919063ffffffff16565b612b7457612b72838281518110612b5a57612b5a615cd5565b60200260200101516011614ebf90919063ffffffff16565b505b600160106000858481518110612b8c57612b8c615cd5565b60209081029190910181015173ffffffffffffffffffffffffffffffffffffffff16825281019190915260400160002055600101612b0c565b505050565b60008181526020819052604081205473ffffffffffffffffffffffffffffffffffffffff16612bf881614b65565b15612c50576040517f7db39b450000000000000000000000000000000000000000000000000000000081526004810184905273ffffffffffffffffffffffffffffffffffffffff821690637db39b45906024016107d0565b612c5981614b78565b15610818576040517f7db39b450000000000000000000000000000000000000000000000000000000081526004810184905273ffffffffffffffffffffffffffffffffffffffff821690637db39b45906024016107d0565b600e5415612d1b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f43460000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b80601a8381548110612d2f57612d2f615cd5565b9060005260206000200154612d449190615bf5565b3414612dac576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b3360009081526010602052604090205415612e23576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f55440000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b80600003612e8d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e564100000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b612e98601d33614eee565b612ea957612ea7601d33614ebf565b505b60008160198481548110612ebf57612ebf615cd5565b600091825260208083209190910154338084526018835260409384902080549590920294850190915582513481529182018490529293507f3686dd4aa3f7c95dcac2734a95dcdcf29641e7e3f71f6ea1b39bc6bea5e36385910160405180910390a2505050565b600c5473ffffffffffffffffffffffffffffffffffffffff163314612fa7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b805160005b81811015612bc557612fc9838281518110612b2957612b29615cd5565b15612ffd57612ffb838281518110612fe357612fe3615cd5565b60200260200101516011614f1d90919063ffffffff16565b505b60006010600085848151811061301557613015615cd5565b60209081029190910181015173ffffffffffffffffffffffffffffffffffffffff16825281019190915260400160002055600101612fac565b600c5473ffffffffffffffffffffffffffffffffffffffff1633146130cf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b600a91909155600b55565b600c5460609073ffffffffffffffffffffffffffffffffffffffff16331461315e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b612a816011614ee1565b600e54156131d2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f43460000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b3360009081526010602052604090205415613249576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f55440000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b601b546000036132b5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e495900000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b83158015906132c5575060648411155b80156132d15750828411155b613337576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565700000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b82158015906133495750620186a08311155b6133af576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b60008681526020819052604090205473ffffffffffffffffffffffffffffffffffffffff161561343b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f44495500000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b600160008190526020527fcc69885fda6bcc1a4ace058b4a62bf5e179ea78fd58a1ccd71c22cc9b688792f5473ffffffffffffffffffffffffffffffffffffffff16806134e6576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0b9060208082526004908201527f4e56505200000000000000000000000000000000000000000000000000000000604082015260600190565b60008781526020818152604080832080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff861617905533808452600283528184208054600181018255908552838520018b905583526017825280832054601890925282205490915060006135716001614b85565b9050821561357f5782613583565b601c545b925080600f60008282546135979190615c3e565b9091555050600082900361361c576135af8184615c3e565b3414613617576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b6136bf565b803414613685576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b6136bf33600090815260186020526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff019055565b6040517f4cfdf9a0000000000000000000000000000000000000000000000000000000008152600481018b9052336024820152604481018a9052606481018990526084810188905260a4810187905260c4810186905260e4810182905273ffffffffffffffffffffffffffffffffffffffff851690634cfdf9a0908390610104016000604051808303818588803b15801561375957600080fd5b505af115801561376d573d6000803e3d6000fd5b505050505050505050505050505050565b600e54156137e8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f43460000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b336000908152601060205260409020541561385f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f55440000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b601b546000036138cb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e495900000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b83158015906138db575060648411155b80156138e75750828411155b61394d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565700000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b821580159061395f5750620186a08311155b6139c5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b60008781526020819052604090205473ffffffffffffffffffffffffffffffffffffffff1615613a51576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f44495500000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b600160008190526020527fcc69885fda6bcc1a4ace058b4a62bf5e179ea78fd58a1ccd71c22cc9b688792f5473ffffffffffffffffffffffffffffffffffffffff1680613afc576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0b9060208082526004908201527f4e56505200000000000000000000000000000000000000000000000000000000604082015260600190565b60008881526020818152604080832080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff861617905533808452600283528184208054600181018255908552838520018c90558352601782528083205460189092528220549091506000613b876001614b85565b90508215613b955782613b99565b601c545b925080600f6000828254613bad9190615c3e565b90915550506000829003613c3257613bc58184615c3e565b3414613c2d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b613cd5565b803414613c9b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b613cd533600090815260186020526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff019055565b6040517f756b1d1c000000000000000000000000000000000000000000000000000000008152600481018c905233602482015273ffffffffffffffffffffffffffffffffffffffff8b81166044830152606482018b9052608482018a905260a4820189905260c4820188905260e48201879052610104820183905285169063756b1d1c90839061012401611360565b600e5415613dce576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f43460000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b3360009081526010602052604090205415613e45576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f55440000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b601b54600003613eb1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e495900000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b8215801590613ec1575060648311155b8015613ecd5750818311155b613f33576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565700000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b8115801590613f455750620186a08211155b613fab576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b60008681526020819052604090205473ffffffffffffffffffffffffffffffffffffffff1615614037576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f44495500000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b6000805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb495473ffffffffffffffffffffffffffffffffffffffff16806140e1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0b9060208082526004908201527f4e56505200000000000000000000000000000000000000000000000000000000604082015260600190565b60008781526020818152604080832080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff861617905533808452600283528184208054600181018255908552838520018b9055835260178252808320546018909252822054909150600061416c6000614b85565b9050821561417a578261417e565b601c545b925080600f60008282546141929190615c3e565b90915550506000829003614271576141ab606482615c87565b600b546141b89190615bf5565b6141c28285615c3e565b6141cc9190615cc2565b341015801561420657506141e1606482615c87565b600a546141ee9190615bf5565b6141f88285615c3e565b6142029190615c3e565b3411155b61426c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b614363565b61427c606482615c87565b600b546142899190615bf5565b6142939082615cc2565b34101580156142c357506142a8606482615c87565b600a546142b59190615bf5565b6142bf9082615c3e565b3411155b614329576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b61436333600090815260186020526040902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff019055565b6040517fbea04f63000000000000000000000000000000000000000000000000000000008152600481018b905233602482015273ffffffffffffffffffffffffffffffffffffffff8a81166044830152606482018a90526084820189905260a4820188905260c4820187905285169063bea04f639060e4016129b5565b606080600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002080548060200260200160405190810160405280929190818152602001828054801561446c57602002820191906000526020600020905b815481526020019060010190808311614458575b50505050509150815167ffffffffffffffff81111561448d5761448d615207565b6040519080825280602002602001820160405280156144b6578160200160208202803683370190505b50905060005b825181101561454f5760008060008584815181106144dc576144dc615cd5565b60209081029190910181015182528101919091526040016000205473ffffffffffffffffffffffffffffffffffffffff16905061451881614b78565b614523576001614526565b60005b60ff1683838151811061453b5761453b615cd5565b6020908102919091010152506001016144bc565b50915091565b600c5473ffffffffffffffffffffffffffffffffffffffff1633146145d6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b73ffffffffffffffffffffffffffffffffffffffff8916156145ff576145fd60138a614ebf565b505b73ffffffffffffffffffffffffffffffffffffffff8a16156146285761462660158b614ebf565b505b600160208190527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb4980547fffffffffffffffffffffffff000000000000000000000000000000000000000090811673ffffffffffffffffffffffffffffffffffffffff9d8e16179091556000919091527fcc69885fda6bcc1a4ace058b4a62bf5e179ea78fd58a1ccd71c22cc9b688792f805482169a8c169a909a17909955600880548a16988b1698909817909755600980548916968a169690961790955560078054881694891694909417909355600680547fffffffff00000000000000000000000000000000000000000000000000000000167401000000000000000000000000000000000000000067ffffffffffffffff949094169390930290961691909117951694909417909255600392909255600455600555565b600c54600f805460009182905573ffffffffffffffffffffffffffffffffffffffff9092169133831461479457600080fd5b47915060008060008047600d545af16147ac57600080fd5b7fc83b5086ce94ec8d5a88a9f5fea4b18a522bb238ed0d2d8abd959549a80c16b86147d78284615cc2565b6040805191825260208201849052015b60405180910390a1505050565b600c5473ffffffffffffffffffffffffffffffffffffffff163314614875576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b80518251146148e0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e564c00000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b815160005b8181101561495c578281815181106148ff576148ff615cd5565b60200260200101516018600086848151811061491d5761491d615cd5565b60209081029190910181015173ffffffffffffffffffffffffffffffffffffffff168252810191909152604001600020805490910190556001016148e5565b507f590a1a0c22d6042324e10baeee375e32704843a4630e1cc9889e30170a5a2efa83836040516147e7929190615d04565b600c5473ffffffffffffffffffffffffffffffffffffffff163314614a0f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b600d80547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b6000818152602081905260408120546060919073ffffffffffffffffffffffffffffffffffffffff16614a8881614b65565b15614b48576040517ffeda8a870000000000000000000000000000000000000000000000000000000081526004810185905273ffffffffffffffffffffffffffffffffffffffff82169063feda8a8790602401600060405180830381865afa158015614af8573d6000803e3d6000fd5b505050506040513d6000823e601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0168201604052614b3e9190810190615d17565b9250925050915091565b600060405180602001604052806000815250909250925050915091565b6000614b72601383614eee565b92915050565b6000614b72601583614eee565b600081600003614e0f576006546007546040517fa47c769600000000000000000000000000000000000000000000000000000000815274010000000000000000000000000000000000000000830467ffffffffffffffff16600482015273ffffffffffffffffffffffffffffffffffffffff92831692600092169063a47c769690602401600060405180830381865afa158015614c26573d6000803e3d6000fd5b505050506040513d6000823e601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0168201604052614c6c9190810190615a75565b505050905060008273ffffffffffffffffffffffffffffffffffffffff1663feaf968c6040518163ffffffff1660e01b815260040160a060405180830381865afa158015614cbe573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190614ce29190615b76565b5050600554600354600454848202819004620347d83a90810282019b50959750670de0b6b3a764000089890204965065c38a96a07000840201949350614d2c83633b9aca00615bf5565b841115614d95576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f47480000000000000000000000000000000000000000000000000000000000006044820152606401610d0b565b84861015614e01576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0b9060208082526004908201527f4e56434200000000000000000000000000000000000000000000000000000000604082015260600190565b505050505050505050919050565b6008546009546040517fb88c914800000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff918216600482015291169063b88c914890602401602060405180830381865afa158015614e81573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190614ea59190615c0c565b6fffffffffffffffffffffffffffffffff1690505b919050565b60006108118373ffffffffffffffffffffffffffffffffffffffff8416614f3f565b6060600061081183614f8e565b73ffffffffffffffffffffffffffffffffffffffff811660009081526001830160205260408120541515610811565b60006108118373ffffffffffffffffffffffffffffffffffffffff8416614fea565b6000818152600183016020526040812054614f8657508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155614b72565b506000614b72565b606081600001805480602002602001604051908101604052809291908181526020018280548015614fde57602002820191906000526020600020905b815481526020019060010190808311614fca575b50505050509050919050565b600081815260018301602052604081205480156150d357600061500e600183615cc2565b855490915060009061502290600190615cc2565b905081811461508757600086600001828154811061504257615042615cd5565b906000526020600020015490508087600001848154811061506557615065615cd5565b6000918252602080832090910192909255918252600188019052604090208390555b855486908061509857615098615de0565b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050614b72565b6000915050614b72565b828054828255906000526020600020908101928215615118579160200282015b828111156151185782518255916020019190600101906150fd565b50615124929150615128565b5090565b5b808211156151245760008155600101615129565b60006020828403121561514f57600080fd5b5035919050565b60008151808452602080850194506020840160005b838110156151875781518752958201959082019060010161516b565b509495945050505050565b6040815260006151a56040830185615156565b82810360208401526151b78185615156565b95945050505050565b600080604083850312156151d357600080fd5b50508035926020909101359150565b73ffffffffffffffffffffffffffffffffffffffff8116811461520457600080fd5b50565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016810167ffffffffffffffff8111828210171561527d5761527d615207565b604052919050565b600067ffffffffffffffff82111561529f5761529f615207565b5060051b60200190565b600082601f8301126152ba57600080fd5b813560206152cf6152ca83615285565b615236565b8083825260208201915060208460051b8701019350868411156152f157600080fd5b602086015b8481101561530d57803583529183019183016152f6565b509695505050505050565b600080600080600080600060e0888a03121561533357600080fd5b873596506020880135615345816151e2565b955060408801359450606088013593506080880135925060a088013567ffffffffffffffff81111561537657600080fd5b6153828a828b016152a9565b92505060c0880135905092959891949750929550565b600080604083850312156153ab57600080fd5b82356153b6816151e2565b946020939093013593505050565b600080604083850312156153d757600080fd5b823567ffffffffffffffff808211156153ef57600080fd5b6153fb868387016152a9565b9350602085013591508082111561541157600080fd5b5061541e858286016152a9565b9150509250929050565b67ffffffffffffffff8116811461520457600080fd5b600080600080600080600080888a036101c081121561545c57600080fd5b8935615467816151e2565b985060208a0135615477816151e2565b975060408a0135615487816151e2565b965060608a0135615497816151e2565b955060808a0135945060a08a013567ffffffffffffffff808211156154bb57600080fd5b6154c78d838e016152a9565b955060c08c01359150808211156154dd57600080fd5b6154e98d838e016152a9565b945060e07fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff208401121561551b57600080fd5b604051925060e083019150828210818311171561553a5761553a615207565b5060405260e08a013561554c816151e2565b81526101008a013561555d816151e2565b60208201526101208a0135615571816151e2565b60408201526101408a013560608201526101608a013560808201526101808a013560a08201526101a08a01356155a681615428565b60c0820152979a96995094975092959194909350565b600080600080600060a086880312156155d457600080fd5b505083359560208501359550604085013594606081013594506080013592509050565b60006020828403121561560957600080fd5b8135610811816151e2565b60008060008060008060c0878903121561562d57600080fd5b86359550602087013561563f816151e2565b945060408701359350606087013592506080870135915060a087013567ffffffffffffffff81111561567057600080fd5b61567c89828a016152a9565b9150509295509295509295565b60008151808452602080850194506020840160005b8381101561518757815173ffffffffffffffffffffffffffffffffffffffff168752958201959082019060010161569e565b6020815260006108116020830184615689565b600082601f8301126156f457600080fd5b813560206157046152ca83615285565b8083825260208201915060208460051b87010193508684111561572657600080fd5b602086015b8481101561530d57803561573e816151e2565b835291830191830161572b565b60006020828403121561575d57600080fd5b813567ffffffffffffffff81111561577457600080fd5b615780848285016156e3565b949350505050565b60008060008060008060c087890312156157a157600080fd5b505084359660208601359650604086013595606081013595506080810135945060a0013592509050565b600080600080600080600060e0888a0312156157e657600080fd5b8735965060208801356157f8816151e2565b96999698505050506040850135946060810135946080820135945060a0820135935060c0909101359150565b60008060008060008060c0878903121561583d57600080fd5b86359550602087013561584f816151e2565b95989597505050506040840135936060810135936080820135935060a0909101359150565b604080825283519082018190526000906020906060840190828701845b828110156158ad57815184529284019290840190600101615891565b50505083810360208501526158c28186615156565b9695505050505050565b6000806000806000806000806000806101408b8d0312156158ec57600080fd5b8a356158f7816151e2565b995060208b0135615907816151e2565b985060408b0135615917816151e2565b975060608b0135615927816151e2565b965060808b0135615937816151e2565b955060a08b013561594781615428565b945060c08b0135615957816151e2565b8094505060e08b013592506101008b013591506101208b013590509295989b9194979a5092959850565b6000806040838503121561599457600080fd5b823567ffffffffffffffff808211156159ac57600080fd5b6153fb868387016156e3565b60005b838110156159d35781810151838201526020016159bb565b50506000910152565b60408152600083518060408401526159fb8160608501602088016159b8565b67ffffffffffffffff93909316602083015250601f919091017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01601606001919050565b600060208284031215615a5157600080fd5b815161081181615428565b600060208284031215615a6e57600080fd5b5051919050565b60008060008060808587031215615a8b57600080fd5b84516bffffffffffffffffffffffff81168114615aa757600080fd5b80945050602080860151615aba81615428565b6040870151909450615acb816151e2565b606087015190935067ffffffffffffffff811115615ae857600080fd5b8601601f81018813615af957600080fd5b8051615b076152ca82615285565b81815260059190911b8201830190838101908a831115615b2657600080fd5b928401925b82841015615b4d578351615b3e816151e2565b82529284019290840190615b2b565b979a9699509497505050505050565b805169ffffffffffffffffffff81168114614eba57600080fd5b600080600080600060a08688031215615b8e57600080fd5b615b9786615b5c565b9450602086015193506040860151925060608601519150615bba60808701615b5c565b90509295509295909350565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b8082028115828204841417614b7257614b72615bc6565b600060208284031215615c1e57600080fd5b81516fffffffffffffffffffffffffffffffff8116811461081157600080fd5b80820180821115614b7257614b72615bc6565b815160009082906020808601845b83811015615c7b57815185529382019390820190600101615c5f565b50929695505050505050565b600082615cbd577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b81810381811115614b7257614b72615bc6565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6040815260006151a56040830185615689565b60008060408385031215615d2a57600080fd5b825167ffffffffffffffff80821115615d4257600080fd5b818501915085601f830112615d5657600080fd5b815181811115615d6857615d68615207565b615d9960207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f84011601615236565b9150808252866020828501011115615db057600080fd5b615dc18160208401602086016159b8565b5080935050506020830151615dd581615428565b809150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fdfea264697066735822122004f2bee65113e1250102a5bfd9b1c2f4b7cc3eb6127a9b2dfb45151ce5a0891164736f6c63430008170033'
const pythBytecode = '0x60c0604052336080523480156200001557600080fd5b506040516200296a3803806200296a83398101604081905262000038916200007b565b600080546001600160a01b0319166001600160a01b039283161790551660a052620000b3565b80516001600160a01b03811681146200007657600080fd5b919050565b600080604083850312156200008f57600080fd5b6200009a836200005e565b9150620000aa602084016200005e565b90509250929050565b60805160a05161287f620000eb60003960008181610d6a01528181610f74015281816115a201526116c201526000505061287f6000f3fe6080604052600436106100dd5760003560e01c80637db39b451161007f578063dc7c70bc11610059578063dc7c70bc14610269578063ed9f2ab514610296578063fc230dd1146102a9578063feda8a87146102bc57600080fd5b80637db39b45146102075780638c40188e14610227578063cd346a051461024957600080fd5b80635b3b0671116100bb5780635b3b0671146101875780635cec78eb146101a7578063756b1d1c146101d45780637b393fdf146101e757600080fd5b80630268cf91146100e257806313a31cbb146101375780634cfdf9a014610172575b600080fd5b3480156100ee57600080fd5b506101196100fd366004611f82565b6000908152600c602052604090205467ffffffffffffffff1690565b60405167ffffffffffffffff90911681526020015b60405180910390f35b34801561014357600080fd5b50610164610152366004611f82565b6000908152600d602052604090205490565b60405190815260200161012e565b610185610180366004611fbf565b6102ea565b005b34801561019357600080fd5b506101856101a236600461222e565b610455565b3480156101b357600080fd5b506101646101c2366004611f82565b6000908152600b602052604090205490565b6101856101e2366004612308565b610805565b3480156101f357600080fd5b5061018561020236600461237c565b610982565b34801561021357600080fd5b50610164610222366004611f82565b610ca4565b34801561023357600080fd5b5061023c610d0d565b60405161012e91906124a1565b34801561025557600080fd5b506101856102643660046124bb565b610e01565b34801561027557600080fd5b50610164610284366004611f82565b60016020526000908152604090205481565b6101856102a436600461237c565b611068565b6101856102b7366004612308565b6113ce565b3480156102c857600080fd5b506102dc6102d7366004611f82565b611543565b60405161012e9291906124e7565b60005473ffffffffffffffffffffffffffffffffffffffff163314610370576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e5653000000000000000000000000000000000000000000000000000000000060448201526064015b60405180910390fd5b6000888152600260208181526040808420889055600182528084208a90556008825280842080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff8d161790556007825280842089905560068252808420879055600590915280832080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169092179091555189917f537fa3a0f9b55fa9be071d301f0ffebbee0dfbd6161849cdd0eac350565ba20891a261044a888383611658565b505050505050505050565b60008681526008602052604090205473ffffffffffffffffffffffffffffffffffffffff1633146104e2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610367565b6000868152600b602052604090205415610558576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f41440000000000000000000000000000000000000000000000000000000000006044820152606401610367565b6000868152600d602052604081205490036105cf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565200000000000000000000000000000000000000000000000000000000006044820152606401610367565b600160008781526005602052604090205460ff1660028111156105f4576105f4612513565b1461065d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103679060208082526004908201527f4e56545900000000000000000000000000000000000000000000000000000000604082015260600190565b60008681526004602090815260409182902054915161067e91849101612542565b60405160208183030381529060405280519060200120146106fb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565400000000000000000000000000000000000000000000000000000000006044820152606401610367565b6000868152600b60205260408082204390555187917f79b0bccf731e154b34feb60bf62e725c682ae17f9289b859629fa30c87a97ce491a26000868152600760205260409020548451148015610752575082518451145b6107b8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e564c00000000000000000000000000000000000000000000000000000000006044820152606401610367565b60008681526003602052604090205473ffffffffffffffffffffffffffffffffffffffff166107ea87878787876117a8565b5060096107fb828787868c86611967565b5050505050505050565b60005473ffffffffffffffffffffffffffffffffffffffff163314610886576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610367565b60008981526002602090815260408083208790556001825280832089905560088252808320805473ffffffffffffffffffffffffffffffffffffffff8d81167fffffffffffffffffffffffff000000000000000000000000000000000000000092831617909255600384528285208054928d16929091169190911790556007825280832088905560068252808320869055600590915280822080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169055518a917f537fa3a0f9b55fa9be071d301f0ffebbee0dfbd6161849cdd0eac350565ba20891a2610976898383611658565b50505050505050505050565b60008581526008602052604090205473ffffffffffffffffffffffffffffffffffffffff163314610a0f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610367565b6000858152600b602052604090205415610a85576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f41440000000000000000000000000000000000000000000000000000000000006044820152606401610367565b6000858152600d60205260408120549003610afc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565200000000000000000000000000000000000000000000000000000000006044820152606401610367565b60008581526005602052604081205460ff166002811115610b1f57610b1f612513565b14610b88576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103679060208082526004908201527f4e56545900000000000000000000000000000000000000000000000000000000604082015260600190565b60405185907f79b0bccf731e154b34feb60bf62e725c682ae17f9289b859629fa30c87a97ce490600090a26000858152600b6020908152604080832043905560079091529020548351148015610bdf575081518351145b610c45576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e564c00000000000000000000000000000000000000000000000000000000006044820152606401610367565b60008581526003602052604090205473ffffffffffffffffffffffffffffffffffffffff16610c7786868686866117a8565b50600086815260066020526040902054600990610c9b908390879087908b86611a25565b50505050505050565b6000818152600760205260408120548103610cc157506000919050565b6000828152600d602052604081205490819003610ce15750600192915050565b6000838152600b60205260408120549003610cff5750600292915050565b50600392915050565b919050565b6040517f7583902f000000000000000000000000000000000000000000000000000000008152736cc14824ea2918f5de5c2f75a9da968ad4bd6344600482015260609060009073ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690637583902f90602401600060405180830381865afa158015610db1573d6000803e3d6000fd5b505050506040513d6000823e601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0168201604052610df7919081019061263a565b60a0015192915050565b6000838152600d602052604090205415610e77576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f41450000000000000000000000000000000000000000000000000000000000006044820152606401610367565b60008381526008602052604090205473ffffffffffffffffffffffffffffffffffffffff163314610f04576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610367565b6000838152600c60205260408082205490517f9371df51000000000000000000000000000000000000000000000000000000008152736cc14824ea2918f5de5c2f75a9da968ad4bd6344600482015267ffffffffffffffff909116602482015260448101849052606481018390527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690639371df51906084016020604051808303816000875af1158015610fd2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ff6919061274c565b6000858152600d60209081526040808320849055600c825291829020549151838152929350839267ffffffffffffffff9092169187917fe48af9a8e640de8478fefc21c374a9603608ebd8d6f578c27ce37a563ef0198e910160405180910390a36110618582611a41565b5050505050565b60008581526008602052604090205473ffffffffffffffffffffffffffffffffffffffff1633146110f5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610367565b6000858152600b60205260409020541561116b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600260248201527f41440000000000000000000000000000000000000000000000000000000000006044820152606401610367565b6000858152600d602052604081205490036111e2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565200000000000000000000000000000000000000000000000000000000006044820152606401610367565b600260008681526005602052604090205460ff16600281111561120757611207612513565b14611270576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103679060208082526004908201527f4e56545900000000000000000000000000000000000000000000000000000000604082015260600190565b60405185907f79b0bccf731e154b34feb60bf62e725c682ae17f9289b859629fa30c87a97ce490600090a26000858152600b60209081526040808320439055600790915290205483511480156112c7575081518351145b61132d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e564c00000000000000000000000000000000000000000000000000000000006044820152606401610367565b6000858152600660205260409020548351349061134a9083612794565b146113b1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565600000000000000000000000000000000000000000000000000000000006044820152606401610367565b6113be86868686866117a8565b506009610c9b8585848a85611ceb565b60005473ffffffffffffffffffffffffffffffffffffffff16331461144f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600360248201527f4e565300000000000000000000000000000000000000000000000000000000006044820152606401610367565b600089815260026020908152604080832087905560018083528184208a905560088352818420805473ffffffffffffffffffffffffffffffffffffffff8e81167fffffffffffffffffffffffff000000000000000000000000000000000000000092831617909255600385528386208054928e1692909116919091179055600783528184208990556005835281842080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001690911790556004909152808220859055518a917f537fa3a0f9b55fa9be071d301f0ffebbee0dfbd6161849cdd0eac350565ba20891a2610976898383611658565b6040517f7583902f000000000000000000000000000000000000000000000000000000008152736cc14824ea2918f5de5c2f75a9da968ad4bd63446004820152606090600090819073ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690637583902f90602401600060405180830381865afa1580156115e9573d6000803e3d6000fd5b505050506040513d6000823e601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016820160405261162f919081019061263a565b60a001516000948552600c602052604090942054939467ffffffffffffffff9094169392505050565b6040517f93cbf217000000000000000000000000000000000000000000000000000000008152736cc14824ea2918f5de5c2f75a9da968ad4bd634460048201526024810183905260006044820181905290819073ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016906393cbf21790859060640160206040518083038185885af115801561170c573d6000803e3d6000fd5b50505050506040513d601f19601f8201168201806040525081019061173191906127b1565b6000868152600c602052604080822080547fffffffffffffffffffffffffffffffffffffffffffffffff00000000000000001667ffffffffffffffff851690811790915590519293509187917fc02197b3ff5c472be6fa270cff9e1ede37ce30d1b90d39ca054d6bf3e782b8e691a3509392505050565b600080845167ffffffffffffffff8111156117c5576117c561201f565b6040519080825280602002602001820160405280156117ee578160200160208202803683370190505b50905060005b85518110156118d75784818151811061180f5761180f6127cc565b6020026020010151868281518110611829576118296127cc565b602002602001015160405160200161186192919091825273ffffffffffffffffffffffffffffffffffffffff16602082015260400190565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe081840301815282825280516020918201209083015201604051602081830303815290604052805190602001208282815181106118c4576118c46127cc565b60209081029190910101526001016117f4565b506000878152600160205260409020546118f49087908386611d70565b61195a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600560248201527f4e5650524f0000000000000000000000000000000000000000000000000000006044820152606401610367565b5060019695505050505050565b8451336040518460005283602052604060002060005b84811015611a11576020808202018a0151602082026020018a01516000528260205260406000208054806119b957637939f4246000526004601cfd5b6020028a015160009182905560609081526040929092529085901b602c526f23b872dd000000000000000000000000600c52806064601c828f5af13d1516611a0957637939f4246000526004601cfd5b60010161197d565b505060006060526040525050505050505050565b604051611a36878787878787611e69565b604052505050505050565b600082815260076020908152604080832054600290925282205490918267ffffffffffffffff811115611a7657611a7661201f565b604051908082528060200260200182016040528015611a9f578160200160208202803683370190505b50905060005b83811015611c8b576000611ab984876127fb565b611ac4906001612836565b6000888152600a60209081526040808320848452909152812054919250819003611b7857611af3836001612836565b600089815260096020908152604080832086845290915290205583518290859085908110611b2357611b236127cc565b6020908102919091010152611b39836001612836565b887f4a3cc1d41a78df84ae08a65deed3d205e3ab998d58c4b80d1b21f836cee796b484604051611b6b91815260200190565b60405180910390a3611c42565b5b6000888152600a6020908152604080832084845290915290205415611bb6576000888152600a602090815260408083209383529290522054611b79565b611bc1836001612836565b600089815260096020908152604080832085845290915290205583518190859085908110611bf157611bf16127cc565b6020908102919091010152611c07836001612836565b887f4a3cc1d41a78df84ae08a65deed3d205e3ab998d58c4b80d1b21f836cee796b483604051611c3991815260200190565b60405180910390a35b506000878152600a60209081526040808320938352929052208390557fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff90920191600101611aa5565b5060005b83811015611ce357600a60008781526020019081526020016000206000838381518110611cbe57611cbe6127cc565b6020026020010151815260200190815260200160002060009055806001019050611c8f565b505050505050565b84516040518360005282602052604060002060005b83811015611d5e5760208082020189015160208202602001890151600052826020526040600020805480611d3c57637939f4246000526004601cfd5b5060008155506000806000808b855af1611d5557600080fd5b50600101611d00565b50506000606052604052505050505050565b60008251855183518560200195508760200197508460200194506001810182840103611e5e5780611dac578682878a1802871851149350611e5e565b8160051b8801811515026040518460051b945060005b858114611dd9578881015182820152602001611dc2565b508481018360051b810193505b815160208301516040840193508951611e2857508b516020909c019b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0909301925b80821160051b918252602091821852604060002082529788019701838110611de6578a83148315178a6020830351141696505050505b505050949350505050565b845180840280606052306040523360601b602c526f23b872dd000000000000000000000000600c52602060006064601c60008c5af13d156001600051141716611eba57637939f4246000526004601cfd5b6000846000528360205260406000208660405260005b84811015611f64576020808202018a0151602082026020018a0151600052826020526040600020805480611f0c57637939f4246000526004601cfd5b50600081555088840193508060601b602c52506fa9059cbb000000000000000000000000600c52602060006044601c60008f5af13d156001600051141716611f5c57637939f4246000526004601cfd5b600101611ed0565b5050808214611f7257600080fd5b5050506000606052505050505050565b600060208284031215611f9457600080fd5b5035919050565b803573ffffffffffffffffffffffffffffffffffffffff81168114610d0857600080fd5b600080600080600080600080610100898b031215611fdc57600080fd5b88359750611fec60208a01611f9b565b979a9799505050506040860135956060810135956080820135955060a0820135945060c0820135935060e0909101359150565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051610140810167ffffffffffffffff811182821017156120725761207261201f565b60405290565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016810167ffffffffffffffff811182821017156120bf576120bf61201f565b604052919050565b600067ffffffffffffffff8211156120e1576120e161201f565b5060051b60200190565b600082601f8301126120fc57600080fd5b8135602061211161210c836120c7565b612078565b8083825260208201915060208460051b87010193508684111561213357600080fd5b602086015b8481101561214f5780358352918301918301612138565b509695505050505050565b600082601f83011261216b57600080fd5b8135602061217b61210c836120c7565b8083825260208201915060208460051b87010193508684111561219d57600080fd5b602086015b8481101561214f576121b381611f9b565b83529183019183016121a2565b600082601f8301126121d157600080fd5b813560206121e161210c836120c7565b8083825260208201915060208460051b87010193508684111561220357600080fd5b602086015b8481101561214f57803580151581146122215760008081fd5b8352918301918301612208565b60008060008060008060c0878903121561224757600080fd5b86359550602087013567ffffffffffffffff8082111561226657600080fd5b6122728a838b016120eb565b9650604089013591508082111561228857600080fd5b6122948a838b0161215a565b955060608901359150808211156122aa57600080fd5b6122b68a838b016120eb565b945060808901359150808211156122cc57600080fd5b6122d88a838b016121c0565b935060a08901359150808211156122ee57600080fd5b506122fb89828a016120eb565b9150509295509295509295565b60008060008060008060008060006101208a8c03121561232757600080fd5b8935985061233760208b01611f9b565b975061234560408b01611f9b565b989b979a5097986060810135985060808101359760a0820135975060c0820135965060e08201359550610100909101359350915050565b600080600080600060a0868803121561239457600080fd5b85359450602086013567ffffffffffffffff808211156123b357600080fd5b6123bf89838a016120eb565b955060408801359150808211156123d557600080fd5b6123e189838a0161215a565b945060608801359150808211156123f757600080fd5b61240389838a016120eb565b9350608088013591508082111561241957600080fd5b50612426888289016121c0565b9150509295509295909350565b60005b8381101561244e578181015183820152602001612436565b50506000910152565b6000815180845261246f816020860160208601612433565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b6020815260006124b46020830184612457565b9392505050565b6000806000606084860312156124d057600080fd5b505081359360208301359350604090920135919050565b6040815260006124fa6040830185612457565b905067ffffffffffffffff831660208301529392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b815160009082906020808601845b8381101561256c57815185529382019390820190600101612550565b50929695505050505050565b80516fffffffffffffffffffffffffffffffff81168114610d0857600080fd5b805167ffffffffffffffff81168114610d0857600080fd5b600082601f8301126125c157600080fd5b815167ffffffffffffffff8111156125db576125db61201f565b61260c60207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f84011601612078565b81815284602083860101111561262157600080fd5b612632826020830160208701612433565b949350505050565b60006020828403121561264c57600080fd5b815167ffffffffffffffff8082111561266457600080fd5b90830190610140828603121561267957600080fd5b61268161204e565b61268a83612578565b815261269860208401612578565b6020820152604083015160408201526126b360608401612598565b60608201526080830151828111156126ca57600080fd5b6126d6878286016125b0565b60808301525060a0830151828111156126ee57600080fd5b6126fa878286016125b0565b60a08301525061270c60c08401612598565b60c082015261271d60e08401612598565b60e08201526101008381015190820152610120915061273d828401612598565b91810191909152949350505050565b60006020828403121561275e57600080fd5b5051919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b80820281158282048414176127ab576127ab612765565b92915050565b6000602082840312156127c357600080fd5b6124b482612598565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600082612831577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500690565b808201808211156127ab576127ab61276556fea2646970667358221220e502aa42c6752fad29b37b885dac9e71c1f9927f7bfdf907498f6cc93e7effc564736f6c63430008170033'
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

async function deploy() {
  const contract = new ethers.ContractFactory(pythAbi, pythBytecode, spicysigner)
  await contract.deploy(entropy_address, registryAddress)
}

async function init() {
  const contract = new ethers.Contract(registryAddress, registryAbi, spicysigner)
  const sig = await contract.connect(spicysigner)
  const priceFeedAddress = '0x0000000000000000000000000000000000000000'
  const vrfCoordinator = '0x0000000000000000000000000000000000000000'
  const entropyAddress = '0xD458261E832415CFd3BAE5E416FdF3230ce6F134'
  const owner = '0x4E046429524e6840406EDe6B4eE87b3CF0165BE3'
  const feeSink = '0x3C06A47B3F3321Fa4A80Ca6148EaD88994F282c9'
  await sig.initialize(
        owner,
        feeSink,
        '0x0000000000000000000000000000000000000000',
        pythAddress,
        ethers.parseEther("0.000003"),
        [5, 10, 30],
        [ethers.parseEther("0.000012"), ethers.parseEther("0.000021"), ethers.parseEther("0.000045")],
        [priceFeedAddress, vrfCoordinator, entropyAddress, 25, 100, 50, 0]
    )
}

// deploy()
init()