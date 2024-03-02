// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
struct Proposal {
    address creator;
    string title;
    string description;
    uint256 yes;
    uint256 no;
}

contract DAO is Ownable{
    IERC20 public tokenAddress;
    uint256 public proposalCounter;
    mapping(uint => Proposal) public proposals;
    mapping(address => mapping(uint => uint)) public votesUsed;

  constructor(
        address _tokenAddress
    ) Ownable(msg.sender) {
        tokenAddress = IERC20(_tokenAddress);
    }

    function createProposal(
        string memory title,
        string memory description
    ) public  {
        Proposal memory data = Proposal(msg.sender, title, description, 0, 0);
        proposals[proposalCounter] = data;
        proposalCounter++;
    }

    function vote(uint256 proposalId, bool _vote) public {
        require(
            votesUsed[msg.sender][proposalId] <=
                tokenAddress.balanceOf(msg.sender) / (10 ** 9),
            "Not enough voting tokens"
        );

        Proposal storage proposal = proposals[proposalId];
        _vote ? proposal.yes++ : proposal.no++;
    }
}