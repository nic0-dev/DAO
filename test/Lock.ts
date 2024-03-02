import { time,loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
  
describe("Basic DAO", function () {
  
    async function deployToken() {
      const token = await ethers.getContractFactory("Token");
      return await token.deploy("MyToken", "MT", 100000);
    }
  
    async function deployDao(tokenAddress: string) {
      const dao = await ethers.getContractFactory("DAO");
      return await dao.deploy(tokenAddress);
    }

    async function deployment() {
      const [owner, otherAccount] = await ethers.getSigners();
      const Token = await deployToken();
      const Dao = await deployDao(await Token.getAddress());
      return { Dao, Token, owner, otherAccount };
    }
  
    describe("Deployment", function () {
  
        it("Should be able to buy tokens", async function () {
            const BUY_AMOUNT = 5;
            const { Token, otherAccount } = await loadFixture(deployment);
            const contract = Token.connect(otherAccount);
            const tx = await contract.buy(BUY_AMOUNT);
            await tx.wait();
            expect(Number(await Token.balanceOf(otherAccount.address))).equal(BUY_AMOUNT * 10 ** 18);
        });
        
        it("Should be able to set token price", async function () {
            const PRICE_CHANGE = 100;
            const { Token } = await loadFixture(deployment);
            const tx = await Token.setPrice(PRICE_CHANGE);
            await tx.wait();
            expect(Number(await Token.tokenPrice())).equal(PRICE_CHANGE);
        });

        it("Should be able to create proposal", async function () {
            const NUMBER_OF_TOKENS = 1;
            const { Token, Dao, otherAccount } = await loadFixture(deployment);
            const tokenContract = Token.connect(otherAccount);
            const tx = await tokenContract.buy(NUMBER_OF_TOKENS);
            await tx.wait();
            const daoContract = Dao.connect(otherAccount);
    
            const PROPOSAL_TITLE: string = "Chicken or Egg";
            const PROPOSAL_DESCRIPTION: string = "What came first?";
            const tx1 = await daoContract.createProposal(PROPOSAL_TITLE, PROPOSAL_DESCRIPTION);
            await tx1.wait();
            const tempProposal = await daoContract.proposals(0);
            expect(tempProposal.creator).equal(otherAccount.address);
            expect(tempProposal.title).equal(PROPOSAL_TITLE);
            expect(tempProposal.description).equal(PROPOSAL_DESCRIPTION);
            expect(tempProposal.yes).equal(0);
            expect(tempProposal.no).equal(0);
        });

        it("Should be able to vote on a proposal", async function () {
            const { Token, Dao, otherAccount } = await loadFixture(deployment);
            const tokenContract = Token.connect(otherAccount);
            const NUMBER_OF_TOKENS = 1;
            const tx = await tokenContract.buy(NUMBER_OF_TOKENS);
            await tx.wait();
      
            const daoContract = Dao.connect(otherAccount);
            const PROPOSAL_TITLE: string = "Chicken or Egg";
            const PROPOSAL_DESCRIPTION: string = "What came first?";
            const tx2 = await daoContract.createProposal(PROPOSAL_TITLE, PROPOSAL_DESCRIPTION);
            await tx2.wait();
      
            const tx3 = await daoContract.vote(0, true);
            await tx3.wait();
      
            const tempProposal = await daoContract.proposals(0);
      
            expect(tempProposal.creator).equal(otherAccount.address);
            expect(tempProposal.title).equal(PROPOSAL_TITLE);
            expect(tempProposal.description).equal(PROPOSAL_DESCRIPTION);
            expect(tempProposal.yes).equal(1);
            expect(tempProposal.no).equal(0);
        });
    });
});