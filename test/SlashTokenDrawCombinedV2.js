const {
  time, loadFixture, reset
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require('fs').promises;
const {min} = require("hardhat/internal/util/bigint");
const { promisify } = require('util');

const filePathFinal = ['../addresses_file_1.json', '../addresses_file_2.json', '../addresses_file_3.json', '../addresses_file_4.json', '../addresses_file_5.json'];

xdescribe("SlashTokenDrawCombinedV2", function () {
    async function completeDeployVrfAndSlashToken() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, thirdUser] = await ethers.getSigners();
        // Vrf deploy and init
        const VRF = await ethers.getContractFactory('VRFCoordinatorV2_5Mock');
        const vrf = await VRF.deploy(100000000000000000n, 1000000000n)
        await vrf.createSubscription()
        await vrf.fundSubscription(1, 10000000000000000000000n)
        // Price feed aggregator deploy
        const PriceFeed = await ethers.getContractFactory('V3Aggregator');
        const priceFeed = await PriceFeed.deploy()
        //Pyth entropy deploy
        const Entropy = await ethers.getContractFactory('DummyEntropyContract');
        const entropy = await Entropy.deploy()
        // Registry deploy
        const SlashTokenDrawRegistry = await ethers.getContractFactory("SlashTokenDrawRegistryV2");
        const slashTokenDrawRegistry = await SlashTokenDrawRegistry.deploy();
        // Chainlink Deploy
        const SlashTokenChainlink = await ethers.getContractFactory("SlashTokenDrawChainlinkV2")
        const slashTokenChainlink = await SlashTokenChainlink.deploy(await vrf.getAddress(), await slashTokenDrawRegistry.getAddress())
        //Pyth Deploy
        const SlashTokenPyth = await ethers.getContractFactory("SlashTokenDrawPythV1")
        const slashTokenPyth = await SlashTokenPyth.deploy(await entropy.getAddress(), await slashTokenDrawRegistry.getAddress())
        // Registry initialise
        await slashTokenDrawRegistry.initialize(owner.address, otherAccount.address, await slashTokenChainlink.getAddress(), await slashTokenPyth.getAddress(), ethers.parseEther("0.03"), [5, 10, 30], [ethers.parseEther("0.12"), ethers.parseEther("0.21"), ethers.parseEther("0.45")], [await priceFeed.getAddress(), await vrf.getAddress(), await entropy.getAddress(), 70, 100, 500, 1])
        await vrf.addConsumer(1, slashTokenChainlink.getAddress())
        return {vrf, entropy, slashTokenDrawRegistry, slashTokenChainlink, slashTokenPyth, owner, otherAccount};
    }
    async function onlyChainlinkDeployVrfAndSlashToken() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, thirdUser] = await ethers.getSigners();
        //Vrf deploy and init
         const VRF = await ethers.getContractFactory('VRFCoordinatorV2_5Mock');
        const vrf = await VRF.deploy(100000000000000000n, 1000000000n)
        await vrf.createSubscription()
        await vrf.fundSubscription(1, 10000000000000000000000n)
        // Price feed aggregator deploy
        const PriceFeed = await ethers.getContractFactory('V3Aggregator');
        const priceFeed = await PriceFeed.deploy()
        //Registry deploy
        const SlashTokenDrawRegistry = await ethers.getContractFactory("SlashTokenDrawRegistryV2");
        const slashTokenDrawRegistry = await SlashTokenDrawRegistry.deploy();
        // Chainlink Deploy
        const SlashTokenChainlink = await ethers.getContractFactory("SlashTokenDrawChainlinkV2")
        const slashTokenChainlink = await SlashTokenChainlink.deploy(await vrf.getAddress(), await slashTokenDrawRegistry.getAddress())
        //Registry initialise
        await slashTokenDrawRegistry.initialize(owner.address, otherAccount.address, await slashTokenChainlink.getAddress(), "0x0000000000000000000000000000000000000000", ethers.parseEther("0.03"), [5, 10, 30], [ethers.parseEther("0.12"), ethers.parseEther("0.21"), ethers.parseEther("0.45")], [await priceFeed.getAddress(), await vrf.getAddress(), '0x0000000000000000000000000000000000000000', 70, 100, 500, 1])
        await vrf.addConsumer(1, slashTokenChainlink.getAddress())
        return {vrf, slashTokenDrawRegistry, slashTokenChainlink, priceFeed, owner, otherAccount};
    }
    async function onlyPythDeployVrfAndSlashToken() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, thirdUser] = await ethers.getSigners();
        //Pyth entropy deploy
        const Entropy = await ethers.getContractFactory('DummyEntropyContract');
        const entropy = await Entropy.deploy()
        //Registry deploy
        const SlashTokenDrawRegistry = await ethers.getContractFactory("SlashTokenDrawRegistryV2");
        const slashTokenDrawRegistry = await SlashTokenDrawRegistry.deploy();
        //Pyth Deploy
        const SlashTokenPyth = await ethers.getContractFactory("SlashTokenDrawPythV1")
        const slashTokenPyth = await SlashTokenPyth.deploy(await entropy.getAddress(), await slashTokenDrawRegistry.getAddress())
        //Registry initialise
        await slashTokenDrawRegistry.initialize(owner.address, otherAccount.address, "0x0000000000000000000000000000000000000000", await slashTokenPyth.getAddress(), ethers.parseEther("0.03"), [5, 10, 30], [ethers.parseEther("0.12"), ethers.parseEther("0.21"), ethers.parseEther("0.45")], ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', await entropy.getAddress(), 25, 100, 150, 1])
        return {entropy, slashTokenDrawRegistry, slashTokenPyth, owner, otherAccount};
    }
    async function completeDeployVrfAndSlashTokenWithoutInit() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, thirdUser] = await ethers.getSigners();
        // Vrf deploy and init
        const VRF = await ethers.getContractFactory('VRFCoordinatorV2_5Mock');
        const vrf = await VRF.deploy(100000000000000000n, 1000000000n)
        await vrf.createSubscription()
        await vrf.fundSubscription(1, 10000000000000000000000n)
        // Price feed aggregator deploy
        const PriceFeed = await ethers.getContractFactory('V3Aggregator');
        const priceFeed = await PriceFeed.deploy()
        //Pyth entropy deploy
        const Entropy = await ethers.getContractFactory('DummyEntropyContract');
        const entropy = await Entropy.deploy()
        // Registry deploy
        const SlashTokenDrawRegistry = await ethers.getContractFactory("SlashTokenDrawRegistryV2");
        const slashTokenDrawRegistry = await SlashTokenDrawRegistry.deploy();
        // Chainlink Deploy
        const SlashTokenChainlink = await ethers.getContractFactory("SlashTokenDrawChainlinkV2")
        const slashTokenChainlink = await SlashTokenChainlink.deploy(await vrf.getAddress(), await slashTokenDrawRegistry.getAddress())
        //Pyth Deploy
        const SlashTokenPyth = await ethers.getContractFactory("SlashTokenDrawPythV1")
        const slashTokenPyth = await SlashTokenPyth.deploy(await entropy.getAddress(), await slashTokenDrawRegistry.getAddress())
        await vrf.addConsumer(1, slashTokenChainlink.getAddress())
        return {vrf, entropy, slashTokenDrawRegistry, slashTokenChainlink, slashTokenPyth, owner, otherAccount};
    }
    async function readAndParseFile(filePath, totalParticipants) {
        try {
            const values = []
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw error;
        }
    }

    describe("Complete Set Up", function () {
        describe("CHAINLINK", function () {
            describe("ERC20", function () {
                describe("E2E Draw", function () {
                    xit("Should run 10 times create merkle tree create draw and elect x winners with up to 100000 participants for ERC20 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 10; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee+serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should run 100 times create merkle tree create draw and elect x winners with up to 10000 participants for ERC20 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        for(let cycle = 0; cycle < 100; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 10000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should run 1000 times create merkle tree create draw and elect x winners with up to 1000 participants for ERC20 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        for(let cycle = 0; cycle < 1000; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should buy a 5 bundle and create 5 draws no cost for ERC20 on Chainlink", async function () {
                         const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        await slashTokenDrawRegistry.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12")})
                        for(let cycle = 0; cycle < 6; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle <5) {
                                await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                }
                                await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                                }
                            }else {
                                await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should buy a 10 bundle and create 10 draws no cost for ERC20 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        await slashTokenDrawRegistry.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21")})
                        for(let cycle = 0; cycle < 11; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle < 10) {
                                await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                }
                                await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                                }
                            } else {
                                await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should buy a 30 bundle and create 30 draws no cost for ERC20 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        await slashTokenDrawRegistry.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45")})
                        for(let cycle = 0; cycle < 31; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle < 30) {
                                await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                }
                                await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                                }
                            } else {
                                await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should create draws with premium cost for ERC20", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        await slashTokenDrawRegistry.setBaseFeeForWallet(owner.address, 1)
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.getBaseFeeForWallet()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should gift draws to user and creat draws with 0 cost for ERC20", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        await slashTokenDrawRegistry.addTxnsToWallets([owner.address], [10])
                        for(let cycle = 0; cycle < 11; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle < 10) {
                                await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                }
                                await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                                }
                            } else {
                                await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                })
                describe("SlashTokenDrawChainlinkV1 functionality tests", function () {
                    xit("Should revert with NVS on createNewErc20Draw if not called by the registry", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        await token.mint(5000000000000000000000000000000n, {from: owner});
                        await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenChainlink.createNewErc20Draw(drawId, owner.address, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser)).revertedWith('NVS')
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NVS on distributeErc20Prizes if not called by the creator", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.connect(otherAccount).distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)).revertedWith("NVS")
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with AD on distributeErc20Prizes if already distributed", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                            await expect(slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)).revertedWith("AD")
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NVL on distributeErc20Prizes if winnerdIds length not match winnerAddresses length", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses.slice(0,winnerAddresses.length - 2), winnerIds, proofFlags)).revertedWith('NVL')
                            await expect(slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds.slice(0, winnerIds.length - 2), proofFlags)).revertedWith("NVL")
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NVTY on distributeErc20Prizes if its not registered as an ERC20 trade", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 10000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)).revertedWith("NVTY")
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NVR on distributeErc20Prizes if request not yet fullfilled", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const vrfResp = 519814141413414n
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)).revertedWith("NVR")
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NVPRO on distributeErc20Prizes if not valid proofs", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        await token.mint(5000000000000000000000000000000n, {from: owner});
                        await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const receipt = await txn.wait()
                        const vrfResp = BigInt(receipt.logs[0].data)
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        proofFlags[proofFlags.length - 1] = !proofFlags[proofFlags.length - 1]
                        await expect(slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)).revertedWith('NVPRO')
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with custom error on distributeErc20Prizes if proofs not match winners", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        await token.mint(5000000000000000000000000000000n, {from: owner});
                        await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const vrfResp = 14619248712983472103492140127401223472934723947n
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        await expect(slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)).revertedWithCustomError(slashTokenChainlink, "TransferFromFailed()")
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with custom error on distributeErc20Prizes if not active approvals", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        await token.mint(5000000000000000000000000000000n, {from: owner});
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const receipt = await txn.wait()
                        const vrfResp = BigInt(receipt.logs[0].data)
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        await expect(slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)).revertedWithCustomError(slashTokenChainlink, "TransferFromFailed()")
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with custom error on distributeErc20Prizes if not valid balance", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        await token.mint(1n, {from: owner});
                        await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const receipt = await txn.wait()
                        const vrfResp = BigInt(receipt.logs[0].data)
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        await expect(slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)).revertedWithCustomError(slashTokenChainlink, "TransferFromFailed()")
                    }).timeout(10000000000000000000000000000000);
                })
                describe("SlashTokenDrawRegistry functionality tests", function () {
                    xit("Should revert with CF on createNewErc20DrawChainlink if contract frozen", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.freezeContract(1)
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('CF')
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with UD on createNewErc20DrawChainlink if caller is denylisted", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.addToDenylist([owner.address])
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('UD')
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NIY on createNewErc20DrawChainlink if registry not initialised", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashTokenWithoutInit);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee})).revertedWith('NIY')
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NVW on createNewErc20DrawChainlink if not valid winners amount", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, 0, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('NVW')
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, 101, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('NVW')
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with DIU on createNewErc20DrawChainlink if drawId already exists", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, 10, totalParticipants, amountPerUser, {value: serviceFee + baseFee})
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, 10, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('DIU')
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NVP on createNewErc20DrawChainlink if not valid participants amount", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, 10, 0, amountPerUser, {value: serviceFee + baseFee})).revertedWith('NVW')
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, 10, 100001, amountPerUser, {value: serviceFee + baseFee})).revertedWith('NVP')
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NVPR on createNewErc20DrawChainlink if not active Chainlink contract", async function (){
                        const {
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(onlyPythDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, 10, 200, amountPerUser, {value: baseFee})).revertedWith('NVPR')
                    }).timeout(10000000000000000000000000000000);
                    xit("Should revert with NVV on createNewErc20DrawChainlink if not correct value", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc20");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee })).revertedWith('NVV')
                    }).timeout(10000000000000000000000000000000);
                })
            })
            xdescribe("Native", function () {
                describe("E2E Draw", function () {
                    xit("Should run 10 times create merkle tree create draw and elect x winners with up to 100000 participants for Native on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const winningHistory = {}
                        for (let i=0; i<100000; i++){
                            winningHistory[finalData[i+1]] = 0n
                        }
                        for(let cycle = 0; cycle < 10; cycle++) {
                            console.log(cycle)
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 100000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee+serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                                winningHistory[leaves[i][1]] += amountPerUser
                            }
                            await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: BigInt(amountPerUser*numOfWinners)})
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should run 100 times create merkle tree create draw and elect x winners with up to 10000 participants for Native on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const winningHistory = {}
                        for (let i=0; i<100000; i++){
                            winningHistory[finalData[i+1]] = 0n
                        }
                        for(let cycle = 0; cycle < 100; cycle++) {
                            console.log(cycle)
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 10000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 100000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                                winningHistory[leaves[i][1]] += amountPerUser
                            }
                            await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: BigInt(amountPerUser*numOfWinners)})
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should run 1000 times create merkle tree create draw and elect x winners with up to 1000 participants for Native on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const winningHistory = {}
                        for (let i=0; i<100000; i++){
                            winningHistory[finalData[i+1]] = 0n
                        }
                        for(let cycle = 0; cycle < 1000; cycle++) {
                            console.log(cycle)
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 10000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                                winningHistory[leaves[i][1]] += amountPerUser
                            }
                            await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: BigInt(amountPerUser*numOfWinners)})
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should buy a 5 bundle and create 5 draws no cost for Native on Chainlink", async function () {
                         const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        const winningHistory = {}
                        for (let i=0; i<1000; i++){
                            winningHistory[allData[i+1]] = 0n
                        }
                        await slashTokenDrawRegistry.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12")})
                        for(let cycle = 0; cycle < 6; cycle++) {
                            console.log(cycle)
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 50000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle <5) {
                                await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                    winningHistory[leaves[i][1]] += amountPerUser
                                }
                                await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: amountPerUser*numOfWinners})
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                                }
                            }else {
                                await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should buy a 10 bundle and create 10 draws no cost for Native on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        const winningHistory = {}
                        for (let i=0; i<1000; i++){
                            winningHistory[allData[i+1]] = 0n
                        }
                        await slashTokenDrawRegistry.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21")})
                        for(let cycle = 0; cycle < 11; cycle++) {
                            console.log(cycle)
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 50000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle < 10) {
                                await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                    winningHistory[leaves[i][1]] += amountPerUser
                                }
                                await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: amountPerUser*numOfWinners})
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                                }
                            }else {
                                await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should buy a 30 bundle and create 30 draws no cost for Native on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        const winningHistory = {}
                        for (let i=0; i<1000; i++){
                            winningHistory[allData[i+1]] = 0n
                        }
                        await slashTokenDrawRegistry.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45")})
                        for(let cycle = 0; cycle < 31; cycle++) {
                            console.log(cycle)
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 50000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle < 30) {
                                await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                    winningHistory[leaves[i][1]] += amountPerUser
                                }
                                await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: amountPerUser*numOfWinners})
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                                }
                            }else {
                                await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should create draws with premium cost for Native", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const winningHistory = {}
                        for (let i=0; i<100000; i++){
                            winningHistory[finalData[i+1]] = 0n
                        }
                        await slashTokenDrawRegistry.setBaseFeeForWallet(owner.address, 1)
                        for(let cycle = 0; cycle < 1; cycle++) {
                            console.log(cycle)
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for (let i = 0; i < totalParticipants; i++) {
                                values.push([i + 1, finalData[i + 1]])
                            }
                            let amountPerUser = getRandomInt(100000, 50000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            const baseFee = await slashTokenDrawRegistry.getBaseFeeForWallet()
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                            for (let i = 0; i < numOfWinners; i++) {
                                const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                if (dict[winnerId] === 0) {
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                                winningHistory[leaves[i][1]] += amountPerUser
                            }
                            await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: BigInt(amountPerUser * numOfWinners)})
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should gift draws to user and creat draws with 0 cost for Native", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const winningHistory = {}
                        for (let i=0; i<1000; i++){
                            winningHistory[finalData[i+1]] = 0n
                        }
                        await slashTokenDrawRegistry.addTxnsToWallets([owner.address], [10])
                        for(let cycle = 0; cycle < 11; cycle++) {
                            console.log(cycle)
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 50000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle < 10) {
                                await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                    winningHistory[leaves[i][1]] += amountPerUser
                                }
                                await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: amountPerUser*numOfWinners})
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                                }
                            }else {
                                await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                })
                describe("SlashTokenDrawChainlinkV1 functionality tests", function () {
                    it("Should revert with NVS on createNewNativeDraw if not called by the registry", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        let amountPerUser = getRandomInt(1000000, 50000000000);
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        await expect(slashTokenChainlink.createNewNativeDraw(drawId, owner.address, root, numOfWinners, totalParticipants, amountPerUser)).revertedWith('NVS')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVS on distributeNativePrizes if not called by the creator", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 500000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.connect(otherAccount).distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)).revertedWith("NVS")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with AD on distributeNativePrizes if already distributed", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 5000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: amountPerUser*numOfWinners})
                            await expect(slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: amountPerUser*numOfWinners})).revertedWith("AD")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVL on distributeNativePrizes if winnerdIds length not match winnerAddresses length", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 5000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses.slice(0,winnerAddresses.length - 2), winnerIds, proofFlags, {value: amountPerUser*numOfWinners})).revertedWith('NVL')
                            await expect(slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds.slice(0, winnerIds.length - 2), proofFlags, {value: amountPerUser*numOfWinners})).revertedWith("NVL")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVTY on distributeNativePrizes if its not registered as a Native trade", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const values = []
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 10000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: numOfWinners*amountPerUser})).revertedWith("NVTY")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVR on distributeNativePrizes if request not yet fullfilled", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(10000, 50000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const vrfResp = 519814141413414n
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: numOfWinners*amountPerUser})).revertedWith("NVR")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVPRO on distributeNativePrizes if not valid proofs", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        let amountPerUser = getRandomInt(100000, 50000000);
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const receipt = await txn.wait()
                        const vrfResp = BigInt(receipt.logs[0].data)
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        proofFlags[proofFlags.length - 1] = !proofFlags[proofFlags.length - 1]
                        await expect(slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: amountPerUser*numOfWinners})).revertedWith('NVPRO')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with custom error on distributeNativePrizes if proofs not match winners", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        let amountPerUser = getRandomInt(1000, 500000);
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const vrfResp = 14619248712983472103492140127401223472934723947n
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        await expect(slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: amountPerUser*numOfWinners})).revertedWithCustomError(slashTokenChainlink, "TransferFromFailed()")
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVV on distributeNativePrizes if not valid value sent", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const receipt = await txn.wait()
                        const vrfResp = BigInt(receipt.logs[0].data)
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        await expect(slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: amountPerUser})).revertedWith( "NVV")
                    }).timeout(10000000000000000000000000000000);
                })
                describe("SlashTokenDrawRegistry functionality tests", function () {
                    it("Should revert with CF on createNewNativeDrawChainlink if contract frozen", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        let amountPerUser = getRandomInt(10000, 50000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.freezeContract(1)
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('CF')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with UD on createNewNativeDrawChainlink if caller is denylisted", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        let amountPerUser = getRandomInt(10000, 50000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.addToDenylist([owner.address])
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('UD')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NIY on createNewNativeDrawChainlink if registry not initialised", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashTokenWithoutInit);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee})).revertedWith('NIY')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVW on createNewNativeDrawChainlink if not valid winners amount", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        let amountPerUser = getRandomInt(10000, 50000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, 0, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('NVW')
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, 101, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('NVW')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with DIU on createNewNativeDrawChainlink if drawId already exists", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        let amountPerUser = getRandomInt(10000, 50000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, 10, totalParticipants, amountPerUser, {value: serviceFee + baseFee})
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, 10, totalParticipants, amountPerUser, {value: serviceFee + baseFee})).revertedWith('DIU')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVP on createNewNativeDrawChainlink if not valid participants amount", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        let amountPerUser = getRandomInt(10000, 500000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, 10, 0, amountPerUser, {value: serviceFee + baseFee})).revertedWith('NVW')
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, 10, 100001, amountPerUser, {value: serviceFee + baseFee})).revertedWith('NVP')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVPR on createNewNativeDrawChainlink if not active Chainlink contract", async function (){
                        const {
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(onlyPythDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        let amountPerUser = getRandomInt(10000, 50000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, 10, 200, amountPerUser, {value: baseFee})).revertedWith('NVPR')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVV on createNewNativeDrawChainlink if not correct value", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        let amountPerUser = getRandomInt(10000, 5000000);
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: serviceFee })).revertedWith('NVV')
                    }).timeout(10000000000000000000000000000000);
                })
            })
            xdescribe("ERC721", function () {
                describe("E2E Draw", function () {
                    xit("Should run 10 times create merkle tree create draw and elect x winners with up to 100000 participants for ERC721 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 10; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee+serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                                expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should run 100 times create merkle tree create draw and elect x winners with up to 10000 participants for ERC721 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        for(let cycle = 0; cycle < 100; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 10000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                                expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    xit("Should run 1000 times create merkle tree create draw and elect x winners with up to 1000 participants for ERC721 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        for(let cycle = 0; cycle < 1000; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                                expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should buy a 5 bundle and create 5 draws no cost for ERC721 on Chainlink", async function () {
                         const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        await slashTokenDrawRegistry.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12")})
                        for(let cycle = 0; cycle < 6; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle <5) {
                                await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                }
                                await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                                    expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                                }
                            }else {
                                await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should buy a 10 bundle and create 10 draws no cost for ERC721 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        await slashTokenDrawRegistry.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21")})
                        for(let cycle = 0; cycle < 11; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle < 10) {
                                await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                }
                                await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                                    expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                                }
                            } else {
                                await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should buy a 30 bundle and create 30 draws no cost for ERC721 on Chainlink", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let allData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            allData = data
                        })
                        await slashTokenDrawRegistry.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45")})
                        for(let cycle = 0; cycle < 31; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(2, 1000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, allData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle < 30) {
                                await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                }
                                await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                                    expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                                }
                            } else {
                                await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should create draws with premium cost for ERC721", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        await slashTokenDrawRegistry.setBaseFeeForWallet(owner.address, 1)
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.getBaseFeeForWallet()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                                expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should gift draws to user and creat draws with 0 cost for ERC721", async function () {
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        await slashTokenDrawRegistry.addTxnsToWallets([owner.address], [10])
                        for(let cycle = 0; cycle < 11; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            if (cycle < 10) {
                                await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee})
                                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                                const receipt = await txn.wait()
                                const vrfResp = BigInt(receipt.logs[0].data)
                                const winners = []
                                const dict = Object.fromEntries(Array.from({length: Number(totalParticipants)}, (_, i) => [BigInt(i + 1), 0]));
                                for (let i = 0; i < numOfWinners; i++) {
                                    const winnerId = (vrfResp % (totalParticipants - BigInt(i))) + 1n
                                    if (dict[winnerId] === 0) {
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
                                const proofLeaves = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    proofLeaves.push(values[winners[i] - 1n])
                                }
                                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                                const winnerAddresses = []
                                const winnerIds = []
                                for (let i = 0; i < numOfWinners; i++) {
                                    winnerAddresses.push(leaves[i][1])
                                    winnerIds.push(leaves[i][0])
                                }
                                await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                                for (let i = 0; i < numOfWinners; i++) {
                                    expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                                    expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                                }
                            } else {
                                await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee})).revertedWith('NVV')
                            }
                        }
                    }).timeout(10000000000000000000000000000000);
                })
                describe("SlashTokenDrawChainlinkV1 functionality tests", function () {
                    it("Should revert with NVS on createNewErc721Draw if not called by the registry", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenChainlink.createNewErc721Draw(drawId, owner.address, await token.getAddress(), root, numOfWinners, totalParticipants, drawId)).revertedWith('NVS')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVS on distributeErc721Prizes if not called by the creator", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.connect(otherAccount).distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)).revertedWith("NVS")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with AD on distributeErc721Prizes if already distributed", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                            await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)).revertedWith("AD")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVL on distributeErc721Prizes if winnerdIds length not match winnerAddresses length", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses.slice(0,winnerAddresses.length - 2), winnerIds, proofFlags, tokenIds)).revertedWith('NVL')
                            await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds.slice(0, winnerIds.length - 2), proofFlags, tokenIds)).revertedWith("NVL")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVTY on distributeErc721Prizes if its not registered as an ERC721 trade", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            let amountPerUser = getRandomInt(100000, 10000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                            const receipt = await txn.wait()
                            const vrfResp = BigInt(receipt.logs[0].data)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, [0])).revertedWith("NVTY")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVR on distributeErc721Prizes if request not yet fullfilled", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        for(let cycle = 0; cycle < 1; cycle++) {
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint(1)
                                await token.approve(await slashTokenChainlink.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                            const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                            const vrfResp = 519814141413414n
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)).revertedWith("NVR")
                        }
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVPRO on distributeErc721Prizes if not valid proofs", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        const tokenIds = []
                        for (let i=0; i<numOfWinners; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const receipt = await txn.wait()
                        const vrfResp = BigInt(receipt.logs[0].data)
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        proofFlags[proofFlags.length - 1] = !proofFlags[proofFlags.length - 1]
                        await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)).revertedWith('NVPRO')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with custom error on distributeErc721Prizes if proofs not match winners", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        const tokenIds = []
                        for (let i=0; i<numOfWinners; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const vrfResp = 14619248712983472103492140127401223472934723947n
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)).revertedWithCustomError(slashTokenChainlink, "TransferFromFailed()")
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with custom error on distributeErc721Prizes if not active approvals", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        const tokenIds = []
                        for (let i=0; i<numOfWinners; i++){
                            await token.mint(1)
                            tokenIds.push(i+1)
                        }
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const receipt = await txn.wait()
                        const vrfResp = BigInt(receipt.logs[0].data)
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)).revertedWithCustomError(slashTokenChainlink, "TransferFromFailed()")
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with custom error on distributeErc721Prizes if not valid balance", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        const tokenIds = []
                        for (let i=0; i<numOfWinners; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        tokenIds.pop()
                        tokenIds.push(2345324)
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const receipt = await txn.wait()
                        const vrfResp = BigInt(receipt.logs[0].data)
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)).revertedWithCustomError(slashTokenChainlink, "TransferFromFailed()")
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVT on distributeErc721Prizes if not valid token Ids", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const numOfWinners = 10n
                        for(let i =0; i< totalParticipants; i++) {
                            values.push([i+1, finalData[i+1]])
                        }
                        const tokenIds = []
                        for (let i=0; i<numOfWinners; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                        const root = tree.root
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee + serviceFee})
                        const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                        const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                        const receipt = await txn.wait()
                        const vrfResp = BigInt(receipt.logs[0].data)
                        const winners = []
                        const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                        for (let i =0; i<numOfWinners;i++){
                            const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                        const proofLeaves = []
                        for (let i = 0; i < numOfWinners; i++) {
                            proofLeaves.push(values[winners[i] - 1n])
                        }
                        const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                        const winnerAddresses = []
                        const winnerIds = []
                        for (let i = 0; i < numOfWinners; i++) {
                            winnerAddresses.push(leaves[i][1])
                            winnerIds.push(leaves[i][0])
                        }
                        tokenIds.pop()
                        tokenIds.push(2345324)
                        await expect(slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)).revertedWith( "NVT")
                    }).timeout(10000000000000000000000000000000);
                })
                describe("SlashTokenDrawRegistry functionality tests", function () {
                    it("Should revert with CF on createNewErc721DrawChainlink if contract frozen", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        const tokenIds = []
                        for (let i=0; i<numOfWinners; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.freezeContract(1)
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee + baseFee})).revertedWith('CF')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with UD on createNewErc721DrawChainlink if caller is denylisted", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        const tokenIds = []
                        for (let i=0; i<numOfWinners; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.addToDenylist([owner.address])
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee + baseFee})).revertedWith('UD')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NIY on createNewErc721DrawChainlink if registry not initialised", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashTokenWithoutInit);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        const tokenIds = []
                        for (let i=0; i<numOfWinners; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee})).revertedWith('NIY')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVW on createNewErc721DrawChainlink if not valid winners amount", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const tokenIds = []
                        for (let i=0; i<10; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, 0, totalParticipants, tokenIds, {value: serviceFee + baseFee})).revertedWith('NVW')
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, 101, totalParticipants, tokenIds, {value: serviceFee + baseFee})).revertedWith('NVW')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with DIU on createNewErc721DrawChainlink if drawId already exists", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const tokenIds = []
                        for (let i=0; i<10; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, 10, totalParticipants, tokenIds, {value: serviceFee + baseFee})
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, 10, totalParticipants, tokenIds, {value: serviceFee + baseFee})).revertedWith('DIU')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVP on createNewErc721DrawChainlink if not valid participants amount", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const tokenIds = []
                        for (let i=0; i<10; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, 10, 0, tokenIds, {value: serviceFee + baseFee})).revertedWith('NVP')
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, 10, 100001, tokenIds, {value: serviceFee + baseFee})).revertedWith('NVP')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVPR on createNewErc721DrawChainlink if not active Chainlink contract", async function (){
                        const {
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(onlyPythDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const tokenIds = []
                        for (let i=0; i<10; i++){
                            await token.mint(1)
                            tokenIds.push(i+1)
                        }
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, 10, 200, tokenIds, {value: baseFee})).revertedWith('NVPR')
                    }).timeout(10000000000000000000000000000000);
                    it("Should revert with NVV on createNewErc721DrawChainlink if not correct value", async function (){
                        const {
                            vrf,
                            entropy,
                            slashTokenDrawRegistry,
                            slashTokenChainlink,
                            slashTokenPyth,
                            owner,
                            otherAccount
                        } = await loadFixture(completeDeployVrfAndSlashToken);
                        let finalData;
                        await readAndParseFile(filePathFinal[0]).then((data) => {
                            finalData = data
                        })
                        const Token = await ethers.getContractFactory("DummyErc721");
                        const token = await Token.deploy({from: owner});
                        const values = []
                        function getRandomInt(min, max) {
                            return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                        }
                        const totalParticipants = getRandomInt(50000, 100000);
                        const minim = min(100n, totalParticipants)
                        const numOfWinners = getRandomInt(2, Number(minim));
                        const tokenIds = []
                        for (let i=0; i<numOfWinners; i++){
                            await token.mint(1)
                            await token.approve(await slashTokenChainlink.getAddress(), i+1)
                            tokenIds.push(i+1)
                        }
                        const root = web3.utils.randomHex(32)
                        const drawId = web3.utils.randomHex(32)
                        const baseFee = await slashTokenDrawRegistry.baseFee()
                        const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                        await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: serviceFee })).revertedWith('NVV')
                    }).timeout(10000000000000000000000000000000);
                })
            })
        })
    });
    xdescribe("Bundles", function () {
        it("Should buy 5 txns bundle", async function () {
                const {
                    vrf,
                    entropy,
                    slashTokenDrawRegistry,
                    slashTokenChainlink,
                    slashTokenPyth,
                    owner,
                    otherAccount
                } = await loadFixture(completeDeployVrfAndSlashToken);
                await expect(slashTokenDrawRegistry.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12"), from: owner}))
                    .to.emit(slashTokenDrawRegistry, "TxnsBundleBought")
                    .withArgs(owner.address, ethers.parseEther("0.12"), 5)
              });
        it("Should buy 10 txns bundle", async function () {
                const {
                    vrf,
                    entropy,
                    slashTokenDrawRegistry,
                    slashTokenChainlink,
                    slashTokenPyth,
                    owner,
                    otherAccount
                } = await loadFixture(completeDeployVrfAndSlashToken);
                await expect(slashTokenDrawRegistry.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.21"), from: owner}))
                    .to.emit(slashTokenDrawRegistry, "TxnsBundleBought")
                    .withArgs(owner.address, ethers.parseEther("0.21"), 10)
              });
        it("Should buy 30 txns bundle", async function () {
                const {
                    vrf,
                    entropy,
                    slashTokenDrawRegistry,
                    slashTokenChainlink,
                    slashTokenPyth,
                    owner,
                    otherAccount
                } = await loadFixture(completeDeployVrfAndSlashToken);
                await expect(slashTokenDrawRegistry.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.45"), from: owner}))
                    .to.emit(slashTokenDrawRegistry, "TxnsBundleBought")
                    .withArgs(owner.address, ethers.parseEther("0.45"), 30)
              });
        it("Should revert with NVV on buy 5 txns bundle with wrong value", async function () {
                const {
                    vrf,
                    entropy,
                    slashTokenDrawRegistry,
                    slashTokenChainlink,
                    slashTokenPyth,
                    owner,
                    otherAccount
                } = await loadFixture(completeDeployVrfAndSlashToken);
                await expect(slashTokenDrawRegistry.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.1"), from: owner}))
                    .to.revertedWith("NVV")
              });
        it("Should revert with NVV on buy 10 txns bundle with wrong value", async function () {
                const {
                    vrf,
                    entropy,
                    slashTokenDrawRegistry,
                    slashTokenChainlink,
                    slashTokenPyth,
                    owner,
                    otherAccount
                } = await loadFixture(completeDeployVrfAndSlashToken);
                await expect(slashTokenDrawRegistry.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.2"), from: owner}))
                    .to.revertedWith("NVV")
              });
        it("Should revert with NVV on buy 30 txns bundle with wrong value", async function () {
                const {
                    vrf,
                    entropy,
                    slashTokenDrawRegistry,
                    slashTokenChainlink,
                    slashTokenPyth,
                    owner,
                    otherAccount
                } = await loadFixture(completeDeployVrfAndSlashToken);
                await expect(slashTokenDrawRegistry.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.4"), from: owner}))
                    .to.revertedWith("NVV")
              });
        it("Should change available txns bundles", async function () {
                const {
                    vrf,
                    entropy,
                    slashTokenDrawRegistry,
                    slashTokenChainlink,
                    slashTokenPyth,
                    owner,
                    otherAccount
                } = await loadFixture(completeDeployVrfAndSlashToken);
                await expect(slashTokenDrawRegistry.updateBundles([7, 18], [ethers.parseEther("0.14"), ethers.parseEther("0.33")],  {from: owner}))
                    .to.emit(slashTokenDrawRegistry, "BundlesUpdated")
                    .withArgs(owner.address, [7, 18], [ethers.parseEther("0.14"), ethers.parseEther("0.33")])
                const response = await slashTokenDrawRegistry.getBundles()
                expect(response[0][0]).to.equal(7n)
                expect(response[0][1]).to.equal(18n)
                expect(response[1][0]).to.equal(140000000000000000n)
                expect(response[1][1]).to.equal(330000000000000000n)
              });
        it("Should buy new bundles when changed available txns", async function () {
                const {
                    vrf,
                    entropy,
                    slashTokenDrawRegistry,
                    slashTokenChainlink,
                    slashTokenPyth,
                    owner,
                    otherAccount
                } = await loadFixture(completeDeployVrfAndSlashToken);
                await expect(slashTokenDrawRegistry.updateBundles([7, 18], [ethers.parseEther("0.14"), ethers.parseEther("0.33")],  {from: owner}))
                    .to.emit(slashTokenDrawRegistry, "BundlesUpdated")
                    .withArgs(owner.address, [7, 18], [ethers.parseEther("0.14"), ethers.parseEther("0.33")])
                await expect(slashTokenDrawRegistry.buyTxnsBundle(0, 1, {value: ethers.parseEther("0.14"), from: owner}))
                    .to.emit(slashTokenDrawRegistry, "TxnsBundleBought")
                    .withArgs(owner.address, ethers.parseEther("0.14"), 7)
                await expect(slashTokenDrawRegistry.buyTxnsBundle(1, 1, {value: ethers.parseEther("0.33"), from: owner}))
                    .to.emit(slashTokenDrawRegistry, "TxnsBundleBought")
                    .withArgs(owner.address, ethers.parseEther("0.33"),  18)
                await expect(slashTokenDrawRegistry.buyTxnsBundle(2, 1, {value: ethers.parseEther("0.33"), from: owner}))
                    .to.revertedWithPanic()
              });
        it("Should revert when user is in denylist", async function () {
            const {
                    vrf,
                    entropy,
                    slashTokenDrawRegistry,
                    slashTokenChainlink,
                    slashTokenPyth,
                    owner,
                    otherAccount
                } = await loadFixture(completeDeployVrfAndSlashToken);
            await slashTokenDrawRegistry.addToDenylist([otherAccount.address])
            await expect(slashTokenDrawRegistry.connect(otherAccount).buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12")})).to.revertedWith('UD')
            await slashTokenDrawRegistry.removeFromDenylist([otherAccount.address], {from: owner})
            await expect(slashTokenDrawRegistry.connect(otherAccount).buyTxnsBundle(0, 1, {value: ethers.parseEther("0.12")}))
                .to.emit(slashTokenDrawRegistry, 'TxnsBundleBought').withArgs(otherAccount.address, ethers.parseEther("0.12"), 5)
        });
    });
    xdescribe("Admin actions", function (){
        it("Should revert if airdrop cost is not set by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).setBaseFeeForWallet(owner.address, ethers.parseEther("0.01"))).revertedWith("NVS")
        });
        it("Should revert if airdrop cost is not reset by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).resetBaseFeeForWallet(owner.address)).revertedWith("NVS")
          });
        it("Should revert if addTxnsToWallets is not called by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).addTxnsToWallets([owner.address], [2])).revertedWith("NVS")
          });
        it("Should revert if setNewBaseFee is not called by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).setNewBaseFee(2)).revertedWith("NVS")
          });
        it("Should revert if updateBundles is not called by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).updateBundles([1], [1])).revertedWith("NVS")
          });
        it("Should revert if freezeContract is not called by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).freezeContract(1)).revertedWith("NVS")
          });
        it("Should revert if updateFeeSink is not called by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).updateFeeSink(owner.address)).revertedWith("NVS")
          });
        it("Should revert if updateConfigs is not called by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).updateConfigs(
                await slashTokenChainlink.getAddress() ,
                '0x0000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000',
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                '0x0000000000000000000000000000000000000000',
                1,
                '0x0000000000000000000000000000000000000000',
                25,
                100,
                150
            )).revertedWith("NVS")
        });
        it("Should revert if claimFees is not called by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).claimFees()).reverted
        });
        it("Should revert if addToDenylist is not called by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).addToDenylist([owner.address])).revertedWith("NVS")
        });
        it("Should revert if removeFromDenylist is not called by admin", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);
            await expect(slashTokenDrawRegistry.connect(otherAccount).removeFromDenylist([owner.address])).revertedWith("NVS")
        });
    });
    xdescribe("Update Pyth and Chainlink Addresses", function (){
        it("Should update the chainlink address and Draw for ERC20", async function () {
            const {entropy, slashTokenDrawRegistry, slashTokenPyth, owner, otherAccount} = await loadFixture(onlyPythDeployVrfAndSlashToken);
            const VRF = await ethers.getContractFactory('VRFCoordinatorV2Mock');
            const vrf = await VRF.deploy(100000000000000000n, 1000000000n)
            await vrf.createSubscription()
            await vrf.fundSubscription(1, 10000000000000000000000n)
            //Price feed aggregator deploy
            const PriceFeed = await ethers.getContractFactory('V3Aggregator');
            const priceFeed = await PriceFeed.deploy()
            //Chainlink Deploy
            const SlashTokenChainlink = await ethers.getContractFactory("SlashTokenDrawChainlinkV1")
            const slashTokenChainlink = await SlashTokenChainlink.deploy(await vrf.getAddress(), await slashTokenDrawRegistry.getAddress())
            await vrf.addConsumer(1, slashTokenChainlink.getAddress())

            await slashTokenDrawRegistry.updateConfigs(
                await slashTokenChainlink.getAddress(),
                await slashTokenPyth.getAddress(),
                await entropy.getAddress(),
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                await vrf.getAddress(),
                1,
                await priceFeed.getAddress(),
                25,
                100,
                150
            )

            let finalData
            await readAndParseFile(filePathFinal[0]).then((data) => {
                finalData = data
            })
            for(let cycle = 0; cycle < 5; cycle++) {
                console.log(cycle)
                const Token = await ethers.getContractFactory("DummyErc20");
                const token = await Token.deploy({from: owner});
                const values = []
                function getRandomInt(min, max) {
                    return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                }
                const totalParticipants = getRandomInt(50000, 100000);
                const minim = min(100n, totalParticipants)
                const numOfWinners = getRandomInt(2, Number(minim));
                for(let i =0; i< totalParticipants; i++) {
                    values.push([i+1, finalData[i+1]])
                }
                await token.mint(5000000000000000000000000000000n, {from: owner});
                await token.approve(await slashTokenChainlink.getAddress(), 5000000000000000000000000000000n)
                let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                const root = tree.root
                const drawId = web3.utils.randomHex(32)
                const baseFee = await slashTokenDrawRegistry.baseFee()
                const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                await slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee+serviceFee})
                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                const receipt = await txn.wait()
                const vrfResp = BigInt(receipt.logs[0].data)
                const winners = []
                const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                for (let i =0; i<numOfWinners;i++){
                    const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                const proofLeaves = []
                for (let i = 0; i < numOfWinners; i++) {
                    proofLeaves.push(values[winners[i] - 1n])
                }
                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                const winnerAddresses = []
                const winnerIds = []
                for (let i = 0; i < numOfWinners; i++) {
                    winnerAddresses.push(leaves[i][1])
                    winnerIds.push(leaves[i][0])
                }
                await slashTokenChainlink.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                for (let i = 0; i < numOfWinners; i++) {
                    expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                }
            }
        }).timeout(10000000000000000000000000000000);
        it("Should update the chainlink address and Draw for Native", async function () {
            const {entropy, slashTokenDrawRegistry, slashTokenPyth, owner, otherAccount} = await loadFixture(onlyPythDeployVrfAndSlashToken);
            const VRF = await ethers.getContractFactory('VRFCoordinatorV2Mock');
            const vrf = await VRF.deploy(100000000000000000n, 1000000000n)
            await vrf.createSubscription()
            await vrf.fundSubscription(1, 10000000000000000000000n)
            //Price feed aggregator deploy
            const PriceFeed = await ethers.getContractFactory('V3Aggregator');
            const priceFeed = await PriceFeed.deploy()
            //Chainlink Deploy
            const SlashTokenChainlink = await ethers.getContractFactory("SlashTokenDrawChainlinkV1")
            const slashTokenChainlink = await SlashTokenChainlink.deploy(await vrf.getAddress(), await slashTokenDrawRegistry.getAddress())
            await vrf.addConsumer(1, slashTokenChainlink.getAddress())

            await slashTokenDrawRegistry.updateConfigs(
                await slashTokenChainlink.getAddress(),
                await slashTokenPyth.getAddress(),
                await entropy.getAddress(),
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                await vrf.getAddress(),
                1,
                await priceFeed.getAddress(),
                25,
                100,
                150
            )

            let finalData
            await readAndParseFile(filePathFinal[0]).then((data) => {
                finalData = data
            })
            const winningHistory = {}
            for (let i=0; i<100000; i++){
                winningHistory[finalData[i+1]] = 0n
            }
            for(let cycle = 0; cycle < 5; cycle++) {
                console.log(cycle)
                const values = []
                function getRandomInt(min, max) {
                    return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                }
                const totalParticipants = getRandomInt(50000, 100000);
                const minim = min(100n, totalParticipants)
                const numOfWinners = getRandomInt(2, Number(minim));
                for(let i =0; i< totalParticipants; i++) {
                    values.push([i+1, finalData[i+1]])
                }
                let amountPerUser = getRandomInt(100000, 100000000);
                const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                const root = tree.root
                const drawId = web3.utils.randomHex(32)
                const baseFee = await slashTokenDrawRegistry.baseFee()
                const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                await slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, numOfWinners, totalParticipants, amountPerUser, {value: baseFee+serviceFee})
                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                const receipt = await txn.wait()
                const vrfResp = BigInt(receipt.logs[0].data)
                const winners = []
                const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                for (let i =0; i<numOfWinners;i++){
                    const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                const proofLeaves = []
                for (let i = 0; i < numOfWinners; i++) {
                    proofLeaves.push(values[winners[i] - 1n])
                }
                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                const winnerAddresses = []
                const winnerIds = []
                for (let i = 0; i < numOfWinners; i++) {
                    winnerAddresses.push(leaves[i][1])
                    winnerIds.push(leaves[i][0])
                    winningHistory[leaves[i][1]] += amountPerUser
                }
                await slashTokenChainlink.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: BigInt(amountPerUser*numOfWinners)})
                for (let i = 0; i < numOfWinners; i++) {
                    expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                }
            }
        }).timeout(10000000000000000000000000000000);
        it("Should update the chainlink address and Draw for ERC721", async function () {
            const {entropy, slashTokenDrawRegistry, slashTokenPyth, owner, otherAccount} = await loadFixture(onlyPythDeployVrfAndSlashToken);
            const VRF = await ethers.getContractFactory('VRFCoordinatorV2Mock');
            const vrf = await VRF.deploy(100000000000000000n, 1000000000n)
            await vrf.createSubscription()
            await vrf.fundSubscription(1, 10000000000000000000000n)
            //Price feed aggregator deploy
            const PriceFeed = await ethers.getContractFactory('V3Aggregator');
            const priceFeed = await PriceFeed.deploy()
            //Chainlink Deploy
            const SlashTokenChainlink = await ethers.getContractFactory("SlashTokenDrawChainlinkV1")
            const slashTokenChainlink = await SlashTokenChainlink.deploy(await vrf.getAddress(), await slashTokenDrawRegistry.getAddress())
            await vrf.addConsumer(1, slashTokenChainlink.getAddress())

            await slashTokenDrawRegistry.updateConfigs(
                await slashTokenChainlink.getAddress(),
                await slashTokenPyth.getAddress(),
                await entropy.getAddress(),
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                await vrf.getAddress(),
                1,
                await priceFeed.getAddress(),
                25,
                100,
                150
            )

            let finalData
            await readAndParseFile(filePathFinal[0]).then((data) => {
                finalData = data
            })
            for(let cycle = 0; cycle < 5; cycle++) {
                console.log(cycle)
                const Token = await ethers.getContractFactory("DummyErc721");
                const token = await Token.deploy({from: owner});
                const values = []
                function getRandomInt(min, max) {
                    return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                }
                const totalParticipants = getRandomInt(50000, 100000);
                const minim = min(100n, totalParticipants)
                const numOfWinners = getRandomInt(2, Number(minim));
                for(let i =0; i< totalParticipants; i++) {
                    values.push([i+1, finalData[i+1]])
                }
                const tokenIds = []
                for (let i=0; i<numOfWinners; i++){
                    await token.mint()
                    await token.approve(await slashTokenChainlink.getAddress(), i+1)
                    tokenIds.push(i+1)
                }
                const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                const root = tree.root
                const drawId = web3.utils.randomHex(32)
                const baseFee = await slashTokenDrawRegistry.baseFee()
                const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(0, 40000000000n)
                await slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, {value: baseFee+serviceFee})
                const requestId = await slashTokenDrawRegistry.getRequestIdForDrawId(drawId)
                const txn = await vrf.fulfillRandomWords(requestId, await slashTokenChainlink.getAddress())
                const receipt = await txn.wait()
                const vrfResp = BigInt(receipt.logs[0].data)
                const winners = []
                const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                for (let i =0; i<numOfWinners;i++){
                    const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                const proofLeaves = []
                for (let i = 0; i < numOfWinners; i++) {
                    proofLeaves.push(values[winners[i] - 1n])
                }
                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                const winnerAddresses = []
                const winnerIds = []
                for (let i = 0; i < numOfWinners; i++) {
                    winnerAddresses.push(leaves[i][1])
                    winnerIds.push(leaves[i][0])
                }
                await slashTokenChainlink.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                for (let i = 0; i < numOfWinners; i++) {
                    expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                    expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                }
            }
        }).timeout(10000000000000000000000000000000);
        it("Should update the pyth address and Draw for ERC20", async function () {
            const {vrf, slashTokenDrawRegistry, slashTokenChainlink, priceFeed, owner, otherAccount} = await loadFixture(onlyChainlinkDeployVrfAndSlashToken);
            // Entropy deploy
            const Entropy = await ethers.getContractFactory('DummyEntropyContract');
            const entropy = await Entropy.deploy()
            // Pyth Deploy
            const SlashTokenPyth = await ethers.getContractFactory("SlashTokenDrawPythV1")
            const slashTokenPyth = await SlashTokenPyth.deploy(await entropy.getAddress(), await slashTokenDrawRegistry.getAddress())

            await slashTokenDrawRegistry.updateConfigs(
                await slashTokenChainlink.getAddress(),
                await slashTokenPyth.getAddress(),
                await entropy.getAddress(),
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                await vrf.getAddress(),
                1,
                await priceFeed.getAddress(),
                25,
                100,
                150
            )

            let finalData
            await readAndParseFile(filePathFinal[0]).then((data) => {
                finalData = data
            })
            for(let cycle = 0; cycle < 5; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc20");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            await token.mint(5000000000000000000000000000000n, {from: owner});
                            await token.approve(await slashTokenPyth.getAddress(), 5000000000000000000000000000000n)
                            let amountPerUser = getRandomInt(100000000, 5000000000000000000000);
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const userRandomNumber = web3.utils.randomHex(32)
                            const providerRandomNumber = web3.utils.randomHex(32)
                            const commitment = web3.utils.keccak256(userRandomNumber);
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(1, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc20DrawPyth(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, amountPerUser, commitment, {value: baseFee+serviceFee})
                            await slashTokenPyth.revealRandomWordsAndElectWinners(drawId, userRandomNumber, providerRandomNumber)
                            const vrfResp = await slashTokenDrawRegistry.getRequestResponse(drawId)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenPyth.distributeErc20Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.balanceOf(winnerAddresses[i])).to.equal(amountPerUser)
                            }
                        }
        }).timeout(10000000000000000000000000000000)
        it("Should update the pyth address and Draw for Native", async function () {
            const {vrf, slashTokenDrawRegistry, slashTokenChainlink, priceFeed, owner, otherAccount} = await loadFixture(onlyChainlinkDeployVrfAndSlashToken);
            // Entropy deploy
            const Entropy = await ethers.getContractFactory('DummyEntropyContract');
            const entropy = await Entropy.deploy()
            // Pyth Deploy
            const SlashTokenPyth = await ethers.getContractFactory("SlashTokenDrawPythV1")
            const slashTokenPyth = await SlashTokenPyth.deploy(await entropy.getAddress(), await slashTokenDrawRegistry.getAddress())

            await slashTokenDrawRegistry.updateConfigs(
                await slashTokenChainlink.getAddress(),
                await slashTokenPyth.getAddress(),
                await entropy.getAddress(),
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                await vrf.getAddress(),
                1,
                await priceFeed.getAddress(),
                25,
                100,
                150
            )

            const winningHistory = {}
            let finalData
            await readAndParseFile(filePathFinal[0]).then((data) => {
                finalData = data
            })
            for (let i=0; i<100000; i++){
                winningHistory[finalData[i+1]] = 0n
            }
            for(let cycle = 0; cycle < 5; cycle++) {
                console.log(cycle)
                const values = []
                function getRandomInt(min, max) {
                    return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                }
                const totalParticipants = getRandomInt(50000, 100000);
                const minim = min(100n, totalParticipants)
                const numOfWinners = getRandomInt(2, Number(minim));
                for(let i =0; i< totalParticipants; i++) {
                    values.push([i+1, finalData[i+1]])
                }
                let amountPerUser = getRandomInt(100000, 100000000);
                const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                const root = tree.root
                const drawId = web3.utils.randomHex(32)
                const userRandomNumber = web3.utils.randomHex(32)
                const providerRandomNumber = web3.utils.randomHex(32)
                const commitment = web3.utils.keccak256(userRandomNumber);
                const baseFee = await slashTokenDrawRegistry.baseFee()
                const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(1, 40000000000n)
                await slashTokenDrawRegistry.createNewNativeDrawPyth(drawId, root, numOfWinners, totalParticipants, amountPerUser, commitment, {value: baseFee+serviceFee})
                await slashTokenPyth.revealRandomWordsAndElectWinners(drawId, userRandomNumber, providerRandomNumber)
                const vrfResp = await slashTokenDrawRegistry.getRequestResponse(drawId)
                const winners = []
                const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                for (let i =0; i<numOfWinners;i++){
                    const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                const proofLeaves = []
                for (let i = 0; i < numOfWinners; i++) {
                    proofLeaves.push(values[winners[i] - 1n])
                }
                const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                const winnerAddresses = []
                const winnerIds = []
                for (let i = 0; i < numOfWinners; i++) {
                    winnerAddresses.push(leaves[i][1])
                    winnerIds.push(leaves[i][0])
                    winningHistory[leaves[i][1]] += amountPerUser
                }
                await slashTokenPyth.distributeNativePrizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, {value: BigInt(amountPerUser*numOfWinners)})
                for (let i = 0; i < numOfWinners; i++) {
                    expect(await ethers.provider.getBalance(winnerAddresses[i])).to.equal(winningHistory[winnerAddresses[i]])
                }
            }
        }).timeout(10000000000000000000000000000000)
        it("Should update the pyth address and Draw for ERC721", async function () {
            const {vrf, slashTokenDrawRegistry, slashTokenChainlink, priceFeed, owner, otherAccount} = await loadFixture(onlyChainlinkDeployVrfAndSlashToken);
            // Entropy deploy
            const Entropy = await ethers.getContractFactory('DummyEntropyContract');
            const entropy = await Entropy.deploy()
            // Pyth Deploy
            const SlashTokenPyth = await ethers.getContractFactory("SlashTokenDrawPythV1")
            const slashTokenPyth = await SlashTokenPyth.deploy(await entropy.getAddress(), await slashTokenDrawRegistry.getAddress())

            await slashTokenDrawRegistry.updateConfigs(
                await slashTokenChainlink.getAddress(),
                await slashTokenPyth.getAddress(),
                await entropy.getAddress(),
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                await vrf.getAddress(),
                1,
                await priceFeed.getAddress(),
                25,
                100,
                150
            )

            let finalData
            await readAndParseFile(filePathFinal[0]).then((data) => {
                finalData = data
            })
            for(let cycle = 0; cycle < 5; cycle++) {
                            console.log(cycle)
                            const Token = await ethers.getContractFactory("DummyErc721");
                            const token = await Token.deploy({from: owner});
                            const values = []
                            function getRandomInt(min, max) {
                                return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
                            }
                            const totalParticipants = getRandomInt(50000, 100000);
                            const minim = min(100n, totalParticipants)
                            const numOfWinners = getRandomInt(2, Number(minim));
                            for(let i =0; i< totalParticipants; i++) {
                                values.push([i+1, finalData[i+1]])
                            }
                            const tokenIds = []
                            for (let i=0; i<numOfWinners; i++){
                                await token.mint()
                                await token.approve(await slashTokenPyth.getAddress(), i+1)
                                tokenIds.push(i+1)
                            }
                            const tree = StandardMerkleTree.of(values, ["uint256", "address"]);
                            const root = tree.root
                            const drawId = web3.utils.randomHex(32)
                            const userRandomNumber = web3.utils.randomHex(32)
                            const providerRandomNumber = web3.utils.randomHex(32)
                            const commitment = web3.utils.keccak256(userRandomNumber);
                            const baseFee = await slashTokenDrawRegistry.baseFee()
                            const [serviceFee, statusCode] = await slashTokenDrawRegistry.calculateVRFCost(1, 40000000000n)
                            await slashTokenDrawRegistry.createNewErc721DrawPyth(drawId, await token.getAddress(), root, numOfWinners, totalParticipants, tokenIds, commitment, {value: baseFee+serviceFee})
                            await slashTokenPyth.revealRandomWordsAndElectWinners(drawId, userRandomNumber, providerRandomNumber)
                            const vrfResp = await slashTokenDrawRegistry.getRequestResponse(drawId)
                            const winners = []
                            const dict = Object.fromEntries(Array.from({ length: Number(totalParticipants) }, (_, i) => [BigInt(i + 1), 0]));
                            for (let i =0; i<numOfWinners;i++){
                                const winnerId = (vrfResp%(totalParticipants - BigInt(i))) + 1n
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
                            const proofLeaves = []
                            for (let i = 0; i < numOfWinners; i++) {
                                proofLeaves.push(values[winners[i] - 1n])
                            }
                            const {proof, leaves, proofFlags} = tree.getMultiProof(proofLeaves)
                            const winnerAddresses = []
                            const winnerIds = []
                            for (let i = 0; i < numOfWinners; i++) {
                                winnerAddresses.push(leaves[i][1])
                                winnerIds.push(leaves[i][0])
                            }
                            await slashTokenPyth.distributeErc721Prizes(drawId, proof, winnerAddresses, winnerIds, proofFlags, tokenIds)
                            for (let i = 0; i < numOfWinners; i++) {
                                expect(await token.ownerOf(i+1)).to.equal(values[winners[i] - 1n][1])
                                expect(await token.balanceOf(values[winners[i] - 1n][1])).to.equal(1)
                            }
                        }
        }).timeout(10000000000000000000000000000000)
        it("Should delete the chainlink address and revert for ERC20 Draw", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);

            const Token = await ethers.getContractFactory("DummyErc20");
            const token = await Token.deploy({from: owner});
            await slashTokenDrawRegistry.updateConfigs(
                '0x0000000000000000000000000000000000000000',
                await slashTokenPyth.getAddress(),
                await entropy.getAddress(),
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                await vrf.getAddress(),
                1,
                '0x0000000000000000000000000000000000000000',
                25,
                100,
                150
            )

            const root = web3.utils.randomHex(32)
            const drawId = web3.utils.randomHex(32)
            const baseFee = await slashTokenDrawRegistry.baseFee()
            await expect(slashTokenDrawRegistry.createNewErc20DrawChainlink(drawId, await token.getAddress(), root, 10, 200, 1, {value: baseFee})).revertedWith('NVPR')
        }).timeout(10000000000000000000000000000000)
        it("Should delete the chainlink address and revert for Native Draw", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);

            await slashTokenDrawRegistry.updateConfigs(
                '0x0000000000000000000000000000000000000000',
                await slashTokenPyth.getAddress(),
                await entropy.getAddress(),
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                await vrf.getAddress(),
                1,
                '0x0000000000000000000000000000000000000000',
                25,
                100,
                150
            )

            const root = web3.utils.randomHex(32)
            const drawId = web3.utils.randomHex(32)
            const baseFee = await slashTokenDrawRegistry.baseFee()
            await expect(slashTokenDrawRegistry.createNewNativeDrawChainlink(drawId, root, 10, 200, 1, {value: baseFee})).revertedWith('NVPR')

        }).timeout(10000000000000000000000000000000)
        it("Should delete the chainlink address and revert for ERC721 Draw", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);

            const Token = await ethers.getContractFactory("DummyErc721");
            const token = await Token.deploy({from: owner});
            await slashTokenDrawRegistry.updateConfigs(
                '0x0000000000000000000000000000000000000000',
                await slashTokenPyth.getAddress(),
                await entropy.getAddress(),
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                '0x0000000000000000000000000000000000000000',
                1,
                '0x0000000000000000000000000000000000000000',
                25,
                100,
                150
            )
            const root = web3.utils.randomHex(32)
            const drawId = web3.utils.randomHex(32)
            const baseFee = await slashTokenDrawRegistry.baseFee()
            await expect(slashTokenDrawRegistry.createNewErc721DrawChainlink(drawId, await token.getAddress(), root, 1, 200, [1], {value: baseFee})).revertedWith('NVPR')

        }).timeout(10000000000000000000000000000000)
        it("Should delete the pyth address and revert for ERC20 Draw", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);

            const Token = await ethers.getContractFactory("DummyErc20");
            const token = await Token.deploy({from: owner});
            await slashTokenDrawRegistry.updateConfigs(
                await slashTokenChainlink.getAddress() ,
                '0x0000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000',
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                '0x0000000000000000000000000000000000000000',
                1,
                '0x0000000000000000000000000000000000000000',
                25,
                100,
                150
            )
            const root = web3.utils.randomHex(32)
            const drawId = web3.utils.randomHex(32)
            const baseFee = await slashTokenDrawRegistry.baseFee()
            await expect(slashTokenDrawRegistry.createNewErc20DrawPyth(drawId, await token.getAddress(), root, 10, 200, 1, drawId, {value: baseFee})).revertedWith('NVPR')
        }).timeout(10000000000000000000000000000000)
        it("Should delete the pyth address and revert for Native Draw", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);

            await slashTokenDrawRegistry.updateConfigs(
                await slashTokenChainlink.getAddress() ,
                '0x0000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000',
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                '0x0000000000000000000000000000000000000000',
                1,
                '0x0000000000000000000000000000000000000000',
                25,
                100,
                150
            )
            const root = web3.utils.randomHex(32)
            const drawId = web3.utils.randomHex(32)
            const baseFee = await slashTokenDrawRegistry.baseFee()
            await expect(slashTokenDrawRegistry.createNewNativeDrawPyth(drawId, root, 10, 200, 1, drawId, {value: baseFee})).revertedWith('NVPR')
        }).timeout(10000000000000000000000000000000)
        it("Should delete the pyth address and revert for ERC721 Draw", async function () {
            const {
                vrf,
                entropy,
                slashTokenDrawRegistry,
                slashTokenChainlink,
                slashTokenPyth,
                owner,
                otherAccount
            } = await loadFixture(completeDeployVrfAndSlashToken);

            const Token = await ethers.getContractFactory("DummyErc721");
            const token = await Token.deploy({from: owner});
            await slashTokenDrawRegistry.updateConfigs(
                await slashTokenChainlink.getAddress() ,
                '0x0000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000',
                '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344',
                '0x0000000000000000000000000000000000000000',
                1,
                '0x0000000000000000000000000000000000000000',
                25,
                100,
                150
            )
            const root = web3.utils.randomHex(32)
            const drawId = web3.utils.randomHex(32)
            const baseFee = await slashTokenDrawRegistry.baseFee()
            await expect(slashTokenDrawRegistry.createNewErc721DrawPyth(drawId, await token.getAddress(), root, 1, 200, [1], drawId, {value: baseFee})).revertedWith('NVPR')
        }).timeout(10000000000000000000000000000000)
    });
});