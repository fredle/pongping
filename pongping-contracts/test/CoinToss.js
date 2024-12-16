const { expect } = require("chai");
const { ethers } = require("hardhat");
const { exec } = require("child_process");


const util = require("util");
const execPromise = util.promisify(exec);
const axios = require('axios');


describe("CoinToss", function () {
    let CoinToss, coinToss, owner, addr1, addr2, signer;

    before(async function () {
        //compile the contract
        const { stdout, stderr } = await execPromise("npx hardhat compile");
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
    });


    beforeEach(async function () {
        CoinToss = await ethers.getContractFactory("CoinToss");
        [owner, addr1, addr2, _] = await ethers.getSigners();
        console.log("owner", owner.address);
        coinToss = await CoinToss.deploy({ value: ethers.parseEther("1") });
        console.log("deployed to",coinToss.target);
    });

    it("should set the correct owner", async function () {
        const contractOwner = await coinToss.owner();
        expect(contractOwner).to.equal(owner.address);
    });

    it("should allow users to deposit funds", async function () {

        await coinToss.connect(addr1).depositFunds({ value: ethers.parseEther("0.5") });
        expect(await coinToss.balances(addr1.address)).to.equal(ethers.parseEther("0.5"));
    });

    it("should allow the owner to withdraw funds", async function () {
        await coinToss.connect(owner).withdraw(ethers.parseEther("0.5"));
        expect(await ethers.provider.getBalance(coinToss.target)).to.equal(ethers.parseEther("0.5"));
    });

    it("should allow users to withdraw their balance", async function () {
        await coinToss.connect(addr1).depositFunds({ value: ethers.parseEther("0.5") });
        await coinToss.connect(addr1).playerWithdraw(ethers.parseEther("0.5"));
        expect(await coinToss.balances(addr1.address)).to.equal(0);
    });

    it("should emit Deposit event on deposit", async function () {
        await expect(coinToss.connect(addr1).depositFunds({ value: ethers.parseEther("0.5") }))
            .to.emit(coinToss, "Deposit")
            .withArgs(addr1.address, ethers.parseEther("0.5"));
    });

    it("should emit CoinTossResult event on coin toss", async function () {
        await coinToss.connect(addr1).depositFunds({ value: ethers.parseEther("0.5") });
        await expect(coinToss.connect(addr1).coinToss(ethers.parseEther("0.1")))
            .to.emit(coinToss, "CoinTossResult");
    });

    it("should allow the owner to withdraw funds", async function () {
        await coinToss.connect(owner).withdraw(ethers.parseEther("0.5"));
        expect(await ethers.provider.getBalance(coinToss.target)).to.equal(ethers.parseEther("0.5"));
    });
    
    it("should only allow the owner to call listAllPlayers", async function () {
        await expect(coinToss.connect(addr1).listAllPlayers()).to.be.revertedWith("Only the owner can call this function");
    });

    it("should return correct players and balances from listAllPlayers", async function () {
        await coinToss.connect(addr1).depositFunds({ value: ethers.parseEther("1") });
        await coinToss.connect(addr2).depositFunds({ value: ethers.parseEther("2") });

        const [players, balances] = await coinToss.listAllPlayers();

        expect(players.length).to.equal(3);
        expect(balances.length).to.equal(3);
        expect(players[0]).to.equal(owner.address);
        expect(players[1]).to.equal(addr1.address);
        expect(players[2]).to.equal(addr2.address);
        expect(balances[0]).to.equal(ethers.parseEther("1"));
        expect(balances[1]).to.equal(ethers.parseEther("1"));
        expect(balances[2]).to.equal(ethers.parseEther("2"));
    });


});