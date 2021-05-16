// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20("Decentralized Bank Currency", "DBC") {
    //add minter variable
    address public minter;

    //add minter changed event
    event MinterChanged(address indexed from, address to);

    constructor() payable {
        //asign initial minter
        minter = msg.sender;
    }

    //Add pass minter role function
    function passMinterRole(address dBank) public onlyMinter returns (bool) {
        minter = dBank;

        emit MinterChanged(msg.sender, dBank);
        return true;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "Error, sender is not minter");
        _;
    }

    function mint(address account, uint256 amount) public onlyMinter {
        //check if msg.sender have minter role
        _mint(account, amount);
    }
}
