from web3 import Web3

contractAddress = '0x0103CfdA95f2D6084d28a935db26Ff1C5cd7DC6d'
contractAbi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "getFlag",
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
          "name": "toggle",
          "type": "uint256"
        }
      ],
      "name": "setFlag",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
mumbaiRPC = "https://rpc-mumbai.maticvigil.com"
w3 = Web3(Web3.HTTPProvider(mumbaiRPC))
pk = ''
user = w3.eth.account.from_key(pk)
dummyContract = w3.eth.contract(address=w3.to_checksum_address(contractAddress), abi=contractAbi)

def setFlag(flag):
    try:
        txn_gas = dummyContract.functions.setFlag(flag).estimate_gas({'from': user.address})
        new_transaction = {
            'nonce': w3.eth.get_transaction_count(user.address),
            'gasPrice': w3.eth.gas_price,
            'from': user.address,
            'gas': txn_gas
        }
        txn = dummyContract.functions.setFlag(flag).build_transaction(new_transaction)
        sign_txn = w3.eth.account.sign_transaction(txn, user.key)
        sent = w3.eth.send_raw_transaction(sign_txn.rawTransaction)
        w3.eth.wait_for_transaction_receipt(sent)
    except Exception as e:
        print(e)

def getFlag():
    flag = dummyContract.functions.getFlag().call({'from': user.address})
    return flag



