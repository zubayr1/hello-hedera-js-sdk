// SPDX-License-Identifier: GPL-3.0

pragma solidity >= 0.7.0;

contract LookUpContract
{
    mapping (string => uint) public myDirectory;

    constructor (string memory _name, uint _number) 
    {
        myDirectory[_name] = _number;
    }

    function setNumber(string memory _name, uint _number) public
    {
        myDirectory[_name] = _number;
    }

    function getNumber(string memory _name) public view returns(uint)
    {
        return myDirectory[_name];
    }
}

//solcjs --bin LookUpContract.sol