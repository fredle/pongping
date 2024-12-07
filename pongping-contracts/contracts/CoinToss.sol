// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract CoinToss is ERC721 {
    // Address of the owner (deployer)
    address public owner;


    // Mapping to store user balances
    mapping(address => uint256) public balances;

    // Event for deposits
    event Deposit(address indexed user, uint256 amount);

    // Event for coin toss results
    event CoinTossResult(address indexed user, string result, uint256 amountWon);

    // Constructor to set the owner
    constructor() ERC721("CoinToss", "CTC") payable {
        require(msg.value > 0, "Contract must be deployed with an initial balance");
        owner = msg.sender;
        balances[owner] = msg.value;
    }

    // Modifier to restrict functions to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Function for users to deposit Ether
    function depositFunds() external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }


    // Function to play the coin toss with a specified bet amount
    function coinToss(uint256 betAmount) external {
        require(betAmount > 0, "Bet amount must be greater than zero");
        require(betAmount <= balances[msg.sender], "Insufficient balance to place bet");

        // Simulate a coin toss (heads = 1, tails = 0)
        uint256 rand = random();
        uint256 normalized = rand % 100;  // Get a number between 0 and 99
        uint256 toss = normalized < 50 ? 0 : 1;  // Map 0-49 to 0 and 50-99 to 1

        if (toss == 1) {
            // User wins: double their bet amount
            uint256 winnings = betAmount * 2;
            require(address(this).balance >= winnings, "Contract does not have enough funds");
            balances[msg.sender] += betAmount;
            //payable(msg.sender).transfer(winnings);
            emit CoinTossResult(msg.sender, "Heads", winnings);
        } else {
            // User loses: deduct their bet amount
            balances[msg.sender] -= betAmount;
            emit CoinTossResult(msg.sender, "Tails", 0);
        }
    }
    // Helper function for pseudo-random number generation
    function random() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
    }
    
    // Function to check the contract's balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }


    // Function to get the balance of the message sender
    function getPlayerBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    // Function for the owner to withdraw funds
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(amount);
    }

    // Function for users to withdraw their balance
    function playerWithdraw(uint256 amount) external {
        require(amount <= balances[msg.sender], "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
    // Function for users to withdraw their balance
    function playerWithdrawAll() external {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }


}