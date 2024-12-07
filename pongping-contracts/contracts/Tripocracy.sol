// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


contract Tripocracy is ERC20, Ownable, ERC20Permit {
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    Proposal[] public proposals;
    mapping(address => bool) public hasVoted;

    uint256 public votingEndTime;

    constructor()
        ERC20("Tripocracy", "TPC")
        Ownable(msg.sender)
        ERC20Permit("Tripocracy")
    {
        _mint(msg.sender, 10000 * 10 ** decimals());
    }

    // Create a new proposal (e.g., holiday destination)
    function createProposal(string memory description) public onlyOwner {
        require(votingEndTime == 0 || block.timestamp > votingEndTime, "Voting is already in progress");
        proposals.push(Proposal({description: description, voteCount: 0}));
        emit ProposalCreated(description);
    }

    function clearProposals() public onlyOwner {
        require(block.timestamp > votingEndTime, "Voting is still ongoing");

        // Clear the proposals array
        delete proposals;

        // Reset the hasVoted mapping
        for (uint256 i = 0; i < proposals.length; i++) {
            delete hasVoted[msg.sender];
        }

        emit ProposalsCleared();
    }
    
    // Start voting
    function startVoting(uint256 durationInSeconds) public onlyOwner {
        require(proposals.length > 0, "No proposals created");
        require(votingEndTime == 0 || block.timestamp > votingEndTime, "Voting is already in progress");
        votingEndTime = block.timestamp + durationInSeconds;

        // Reset votes
        for (uint256 i = 0; i < proposals.length; i++) {
            proposals[i].voteCount = 0;
        }

        for (uint256 i = 0; i < proposals.length; i++) {
            delete hasVoted[msg.sender];
        }

        emit VotingStarted(durationInSeconds);
    }

    // Vote on a proposal
    function vote(uint256 proposalIndex) public {
        require(block.timestamp < votingEndTime, "Voting has ended");
        require(balanceOf(msg.sender) > 0, "You must hold tokens to vote");
        require(!hasVoted[msg.sender], "You have already voted");

        proposals[proposalIndex].voteCount += balanceOf(msg.sender);
        hasVoted[msg.sender] = true;

        emit Voted(msg.sender, proposalIndex);
    }

    // Get the winning proposal
    function getWinningProposal() public view returns (string memory) {
        require(block.timestamp > votingEndTime, "Voting is still ongoing");
        uint256 winningIndex = 0;
        uint256 highestVoteCount = 0;

        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > highestVoteCount) {
                highestVoteCount = proposals[i].voteCount;
                winningIndex = i;
            }
        }

        return proposals[winningIndex].description;
    }

    // Extend the voting period
    function extendVoting(uint256 additionalTime) public onlyOwner {
        require(block.timestamp < votingEndTime, "Voting has ended");
        votingEndTime += additionalTime;
    }

    // Cancel the current voting session
    function cancelVoting() public onlyOwner {
        require(block.timestamp < votingEndTime, "Voting is still ongoing");
        votingEndTime = 0;
    }

    // Get details of a specific proposal
    function getProposal(uint256 proposalIndex) public view returns (string memory description, uint256 voteCount) {
        require(proposalIndex < proposals.length, "Proposal does not exist");
        Proposal storage proposal = proposals[proposalIndex];
        return (proposal.description, proposal.voteCount);
    }

    // Get all proposals
    function getAllProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    // Emit events for actions
    event ProposalCreated(string description);
    event VotingStarted(uint256 duration);
    event Voted(address voter, uint256 proposalIndex);
    event ProposalsCleared();
}
