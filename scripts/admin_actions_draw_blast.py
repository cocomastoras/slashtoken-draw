import csv
import sys
from web3 import Web3

drawRegistrty_abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "Operator",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256[]",
          "name": "BundlesAmounts",
          "type": "uint256[]"
        },
        {
          "indexed": False,
          "internalType": "uint256[]",
          "name": "BundlesPrices",
          "type": "uint256[]"
        }
      ],
      "name": "BundlesUpdated",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "SF",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "OF",
          "type": "uint256"
        }
      ],
      "name": "Claimed",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "address[]",
          "name": "Wallet",
          "type": "address[]"
        },
        {
          "indexed": False,
          "internalType": "uint256[]",
          "name": "Txns",
          "type": "uint256[]"
        }
      ],
      "name": "TxnsAdded",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "Buyer",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "Amount",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "Txns",
          "type": "uint256"
        }
      ],
      "name": "TxnsBundleBought",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "Wallet",
          "type": "address"
        }
      ],
      "name": "WalletBaseFeeReset",
      "type": "event"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "address",
          "name": "Wallet",
          "type": "address"
        },
        {
          "indexed": False,
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
      "inputs": [],
      "name": "claimMaxGas",
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
        },
        {
          "internalType": "address",
          "name": "gasSink_",
          "type": "address"
        }
      ],
      "name": "updateSinks",
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

testnet_providers = ['https://blast-sepolia.blockpi.network/v1/rpc/public']


contract_address = ['0x2ab7b3f28705A97F530178E80c272D8293227B05']

admin_pk = ''

def extract_address_and_txns_from_csv(csv_file_path, w3):
    with open(csv_file_path, 'r', encoding='utf-8-sig') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        recipients = []
        amounts = []
        for row in csv_reader:
            recipients.append(w3.to_checksum_address(row['recipient']))
            amounts.append(int(row['amount']))
        return recipients, amounts

def extract_addresses_from_csv(csv_file_path, w3):
    with open(csv_file_path, 'r', encoding='utf-8-sig') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        recipients = []
        for row in csv_reader:
            recipients.append(w3.to_checksum_address(row['recipient']))
        return recipients

def extract_bundles_and_prices_from_csv(csv_file_path):
    with open(csv_file_path, 'r', encoding='utf-8-sig') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        bundles = []
        prices = []
        for row in csv_reader:
            bundles.append(int(row['bundle']))
            prices.append(int(row['price']))
        return bundles, prices

def freeze_contract():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        txn_gas = drawRegistrty_contract.functions.freezeContract(1).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.freezeContract(1).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def unfreeze_contract():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        txn_gas = drawRegistrty_contract.functions.freezeContract(0).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.freezeContract(0).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def update_sinks():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        txn_gas = drawRegistrty_contract.functions.updateSinks(w3.to_checksum_address(sys.argv[2]), w3.to_checksum_address(sys.argv[3])).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.updateSinks(w3.to_checksum_address(sys.argv[2]), w3.to_checksum_address(sys.argv[3])).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def claim_fees():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        txn_gas = drawRegistrty_contract.functions.claimFees().estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.claimFees().build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)


def claim_gas():
  for provider in testnet_providers:
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    drawRegistrty_contract = w3.eth.contract(
      address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
    txn_gas = drawRegistrty_contract.functions.claimMaxGas().estimate_gas({'from': admin.address})
    new_transaction = {
      'nonce': w3.eth.get_transaction_count(admin.address),
      'gasPrice': w3.eth.gas_price,
      'from': admin.address,
      'gas': txn_gas
    }
    try:
      txn = drawRegistrty_contract.functions.claimMaxGas().build_transaction(new_transaction)
      sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
      sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
      w3.eth.wait_for_transaction_receipt(sent)
    except:
      print("Failed for Rpc:", provider)

def add_to_denylist():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        denylist = extract_addresses_from_csv(sys.argv[2], w3)
        txn_gas = drawRegistrty_contract.functions.addToDenylist(denylist).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.addToDenylist(denylist).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def remove_from_denylist():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        denylist = extract_addresses_from_csv(sys.argv[2], w3)
        txn_gas = drawRegistrty_contract.functions.removeFromDenylist(denylist).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.removeFromDenylist(denylist).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def get_denylist():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        print(drawRegistrty_contract.functions.getDenylist().call({'from': '0x4E046429524e6840406EDe6B4eE87b3CF0165BE3'}))

def get_users_that_bought_bundles():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        print(drawRegistrty_contract.functions.getUsersThatBoughtBundles().call({'from': '0x4E046429524e6840406EDe6B4eE87b3CF0165BE3'}))

def update_bundles():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        bundles, prices = extract_bundles_and_prices_from_csv(sys.argv[2])
        txn_gas = drawRegistrty_contract.functions.updateBundles(bundles, prices).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.updateBundles(bundles, prices).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def set_new_base_fee():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        txn_gas = drawRegistrty_contract.functions.setNewBaseFee(int(sys.argv[2])).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.setNewBaseFee(int(sys.argv[2])).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def add_txns_to_wallets():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        recipients, txns = extract_address_and_txns_from_csv(sys.argv[2], w3)
        txn_gas = drawRegistrty_contract.functions.addTxnsToWallets(recipients, txns).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.addTxnsToWallets(recipients, txns).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def set_base_fee_for_wallet():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        txn_gas = drawRegistrty_contract.functions.setBaseFeeForWallet(w3.to_checksum_address(sys.argv[2]), int(sys.argv[3])).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.setBaseFeeForWallet(w3.to_checksum_address(sys.argv[2]), int(sys.argv[3])).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def reset_base_fee_for_wallet():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        txn_gas = drawRegistrty_contract.functions.resetBaseFeeForWallet(w3.to_checksum_address(sys.argv[2])).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.resetBaseFeeForWallet(w3.to_checksum_address(sys.argv[2])).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def update_configs():
    provider = ''
    if sys.argv[12] == 'Arb':
        provider = testnet_providers[0]
    elif sys.argv[12] == 'Sepolia':
        provider = testnet_providers[1]
    elif sys.argv[12] == 'Chiliz':
        provider = testnet_providers[2]
    w3 = Web3(Web3.HTTPProvider(provider))
    admin = w3.eth.account.from_key(admin_pk)
    drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
    txn_gas = drawRegistrty_contract.functions.updateConfigs(w3.to_checksum_address(sys.argv[2]),
                                                             w3.to_checksum_address(sys.argv[3]),
                                                             w3.to_checksum_address(sys.argv[4]),
                                                             w3.to_checksum_address(sys.argv[5]),
                                                             w3.to_checksum_address(sys.argv[6]),
                                                             int(sys.argv[7]),
                                                             w3.to_checksum_address(sys.argv[8]),
                                                             int(sys.argv[9]),
                                                             int(sys.argv[10]),
                                                             int(sys.argv[11])).estimate_gas({'from': admin.address})
    new_transaction = {
        'nonce': w3.eth.get_transaction_count(admin.address),
        'gasPrice': w3.eth.gas_price,
        'from': admin.address,
        'gas': txn_gas
    }
    try:
        txn = drawRegistrty_contract.functions.updateConfigs(w3.to_checksum_address(sys.argv[2]),
                                                             w3.to_checksum_address(sys.argv[3]),
                                                             w3.to_checksum_address(sys.argv[4]),
                                                             w3.to_checksum_address(sys.argv[5]),
                                                             w3.to_checksum_address(sys.argv[6]),
                                                             int(sys.argv[7]),
                                                             w3.to_checksum_address(sys.argv[8]),
                                                             int(sys.argv[9]),
                                                             int(sys.argv[10]),
                                                             int(sys.argv[11])).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except:
        print("Failed for Rpc:", provider)

def update_slippage():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        admin = w3.eth.account.from_key(admin_pk)
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        txn_gas = drawRegistrty_contract.functions.updateSlippage(int(sys.argv[2]), int(sys.argv[3])).estimate_gas({'from': admin.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(admin.address),
            'gasPrice': w3.eth.gas_price,
            'from': admin.address,
            'gas': txn_gas
        }
        try:
            txn = drawRegistrty_contract.functions.updateSlippage(int(sys.argv[2]), int(sys.argv[3])).build_transaction(new_transaction)
            sign_txn = w3.eth.account.sign_transaction(txn, admin.key)
            sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
            w3.eth.wait_for_transaction_receipt(sent)
        except:
            print("Failed for Rpc:", provider)

def get_balance():
    for provider in testnet_providers:
        w3 = Web3(Web3.HTTPProvider(provider))
        drawRegistrty_contract = w3.eth.contract(address=w3.to_checksum_address(contract_address[testnet_providers.index(provider)]), abi=drawRegistrty_abi)
        print(drawRegistrty_contract.functions.getInfo().call())


methods = {
        'freezeContract': freeze_contract,
        'unfreezeContract': unfreeze_contract,
        'updateSinks': update_sinks,
        'claimFees': claim_fees,
        'addToDenylist': add_to_denylist,
        'removeFromDenylist': remove_from_denylist,
        'getDenylist': get_denylist,
        'getUsersThatBoughtBundles': get_users_that_bought_bundles,
        'updateBundles': update_bundles,
        'setNewBaseFee': set_new_base_fee,
        'addTxnsToWallets': add_txns_to_wallets,
        'setBaseFeeForWallet': set_base_fee_for_wallet,
        'resetBaseFeeForWallet': reset_base_fee_for_wallet,
        'updadeConfigs': update_configs,
        'updateSlippage': update_slippage,
        'getBalance': get_balance,
        'claimGas': claim_gas
    }

def main():
    methods[sys.argv[1]]()

if __name__ == "__main__":
    main()


