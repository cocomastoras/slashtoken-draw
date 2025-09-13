const { ethers} = require("ethers");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require('fs').promises;

//Network config
const contractAddress = '0x0103CfdA95f2D6084d28a935db26Ff1C5cd7DC6d'
const contractAbi = [
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
const mumbaiRPC = "https://rpc-mumbai.maticvigil.com"
const mumbaiProvider = new ethers.JsonRpcProvider(mumbaiRPC)
const pk = ''
const mumbaiSigner = new ethers.Wallet(pk, mumbaiProvider)
const dummyContract = new ethers.Contract(contractAddress, contractAbi, mumbaiSigner)

async function setFlag( flag){
    const signer = dummyContract.connect(mumbaiSigner);
    // flag 0 sets flag to 0
    // flag 1 sets flag to 1
    // flag > 1 reverts with NVF
    const tx = await signer.setFlag(flag)
    await tx.wait()
}
async function getFlag(){
    const signer = dummyContract.connect(mumbaiSigner);
    return await signer.getFlag()
}



