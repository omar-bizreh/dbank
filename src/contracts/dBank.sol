// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./Token.sol";

contract dBank {
    //assign Token contract to variable
    Token private token;

    //add mappings
    mapping(address => uint256) public etherBalanceOf;
    mapping(address => uint256) public depositStart;
    mapping(address => bool) public isDeposited;

    //add events
    event Deposit(address indexed user, uint256 etherAmount, uint256 timeStart);
    event Withdraw(
        address indexed user,
        uint256 etherAmount,
        uint256 depositTime,
        uint256 interest
    );

    //pass as constructor argument deployed Token contract
    constructor(Token _token) {
        //assign token deployed contract to variable
        token = _token;
    }

    modifier hasEnoughEther() {
        require(msg.value >= 1e16); // 0.01 Ether
        _;
    }

    modifier didNotDeposite() {
        require(isDeposited[msg.sender] == false);
        _;
    }

    modifier didDeposit() {
        require(isDeposited[msg.sender] == true);
        _;
    }

    function deposit() public payable didNotDeposite hasEnoughEther {
        //increase msg.sender ether deposit balance
        etherBalanceOf[msg.sender] += msg.value;
        //start msg.sender hodling time
        depositStart[msg.sender] += block.timestamp;
        //set msg.sender deposit status to true
        isDeposited[msg.sender] = true;
        //emit Deposit event
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() public payable didDeposit {
        //assign msg.sender ether deposit balance to variable for event
        uint256 userBalance = etherBalanceOf[msg.sender];
        //check user's hodl time
        uint256 depositTime = block.timestamp + depositStart[msg.sender];

        uint256 interestPerSecond =
            31668017 * (etherBalanceOf[msg.sender] / 1e16);
        uint256 interest = interestPerSecond * depositTime;

        //calc interest per second
        //calc accrued interest
        //send eth to user
        payable(msg.sender).transfer(userBalance);
        //send interest in tokens to user
        token.mint(msg.sender, interest);
        //reset depositer data
        depositStart[msg.sender] = 0;
        etherBalanceOf[msg.sender] = 0;
        isDeposited[msg.sender] = false;
        //emit event
        emit Withdraw(msg.sender, userBalance, depositTime, interest);
    }

    function borrow() public payable hasEnoughEther {
        //check if collateral is >= than 0.01 ETH
        //check if user doesn't have active loan
        //add msg.value to ether collateral
        //calc tokens amount to mint, 50% of msg.value
        //mint&send tokens to user
        //activate borrower's loan status
        //emit event
    }

    function payOff() public {
        //check if loan is active
        //transfer tokens from user back to the contract
        //calc fee
        //send user's collateral minus fee
        //reset borrower's data
        //emit event
    }
}
