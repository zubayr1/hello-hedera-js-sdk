// SPDX-License-Identifier: GPL-3.0

pragma solidity>=0.7.0 <0.9.0;

contract LookupContract
{
    mapping (string => uint256) public mydirectory;

    constructor (string memory _name, uint256 _number) 
    {
        mydirectory[_name] = _number;
    }

    function setnumber(string memory _name, uint256 _number) public
    {
        mydirectory[_name] = _number;
    }

    function getnumber(string memory _name) public view returns(uint256)
    {
        return mydirectory[_name];
    }
}