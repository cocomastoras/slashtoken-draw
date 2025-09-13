const { ethers} = require("ethers");
var Web3 = require('web3');

const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require('fs').promises;

//Network config
const abi = [
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
      "inputs": [],
      "name": "AssertionFailure",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BlockhashUnavailable",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "IncorrectRevelation",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientFee",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidUpgradeMagic",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoSuchProvider",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoSuchRequest",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OutOfRandomness",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProviderAlreadyRegistered",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Unauthorized",
      "type": "error"
    },
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
const rpc = 'https://sepolia-rollup.arbitrum.io/rpc'
const contract_address_testnet = '0x3570b83d35f8d9446afefab8e889a71dcb521746'

const pythAddress = '0xe0698fAaBadd7d03A8b08C2a311b1788651a0B85'

const provider = new ethers.JsonRpcProvider(rpc)
const pk = ''
const wallet = new ethers.Wallet(pk, provider)
const contract = new ethers.Contract(contract_address_testnet, abi, wallet)
const pythContract = new ethers.Contract(pythAddress, pythAbi, wallet)

//Merkle config
const values = []
const totalParticipants = 10n;
const totalWinners = 1;
const winnerIds = []
const winnerAddresses = []
let treeProof = []
let treeProofFlags = []

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
async function createNewNativeDrawPyth(){
    await readAndParseFile()
    const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
    const root = tree.root
    const drawId = Web3.utils.randomHex(32)
    console.log("DrawId: ", drawId)
    const userRandomNumber = Web3.utils.randomHex(32)
    console.log("User random number: ", userRandomNumber)
    const commitment = Web3.utils.keccak256(userRandomNumber);
    const baseFee = await contract.baseFee()
    const serviceFee = await contract.calculateVRFCost(1, 0)
    const signer = contract.connect(wallet);
    const tx = await signer.createNewNativeDrawPyth(drawId, root, totalWinners, totalParticipants, 100000, commitment, {value: baseFee + serviceFee[0]})
    await tx.wait()
}

async function createNewNativeDrawChainlink(){
    await readAndParseFile()
    const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
    const root = tree.root
    const drawId = Web3.utils.randomHex(32)
    console.log("DrawId: ", drawId)
    const baseFee = await contract.baseFee()
    const feeData = (await provider.getFeeData()).gasPrice
    const serviceFee = await contract.calculateVRFCost(0, feeData)
    const signer = contract.connect(wallet);
    const tx = await signer.createNewNativeDrawChainlink(drawId, root, totalWinners, totalParticipants, 100000, {value: baseFee + serviceFee[0], gasPrice: feeData})
    await tx.wait()
}

async function createNewNativeDraw(){
    await readAndParseFile()
    const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
    const root = tree.root
    const drawId = Web3.utils.randomHex(32)
    console.log("DrawId: ", drawId)
    const baseFee = await contract.baseFee()
    const serviceFee = await contract.calculateVRFCost(0)
    const signer = contract.connect(wallet);
    const tx = await signer.createNewNativeDrawChainlink(drawId, root, totalWinners, totalParticipants, 100000, {value: baseFee + serviceFee[0]})
    await tx.wait()
}


async function revealAndelectWinners() {
    const vrfResp = '0xc18513c797fc3f30ffe044d048ca6141820335c7ccd3cfabec04a4f978518ab6'
    const userRandom = '0x890fd002962ec9352ab5737952d7d99090513c6538323dac060e4108a6dd3ce0'
    const drawId = '0x7144d081bccc18da8c866b8c6a78ca1d01ae2ff0a9e677a7c7cbd2f81f9b18a6'
    const signer = pythContract.connect(wallet);
    const tx = await signer.revealRandomWordsAndElectWinners(drawId, userRandom, vrfResp)
    await tx.wait()
}

// createNewNativeDrawChainlink()
// revealAndelectWinners()
//Arbitrum pyth
// DrawId:  0x7144d081bccc18da8c866b8c6a78ca1d01ae2ff0a9e677a7c7cbd2f81f9b18a6
// User random number:  0x890fd002962ec9352ab5737952d7d99090513c6538323dac060e4108a6dd3ce0
// sequence number: 4

//Chiliz pyth
// DrawId:  0x0a56223adddbb4d33a135101481a2e6350450f0960c2fa735f2c5c647221cd45
// User random number:  0x1225a251927c6947da0e632d66b41c88f94154e812173bfc68601fde2914155d
// sequence number: 44
