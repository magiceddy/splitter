pragma solidity 0.4.21;


contract Splitter {

    address public owner;

    event LogSplit(address from, address firstBeneficiary, address secondBeneficiary, uint256 amount);

    function Splitter() public payable {
        owner = msg.sender;
    }

    function split(address firstBeneficiary, address secondBeneficiary)
        public
        payable
        returns (bool) 
    {
        require(msg.value > 0);
        require(msg.value % 2 == 0);
        require(firstBeneficiary != msg.sender);
        require(secondBeneficiary != msg.sender);
        require(firstBeneficiary != secondBeneficiary);
        
        uint256 amountPerSingleUser = msg.value / 2;
        

        firstBeneficiary.transfer(amountPerSingleUser);
        secondBeneficiary.transfer(amountPerSingleUser);

        assert(address(this).balance == 0);
        
        emit LogSplit(
            msg.sender, 
            firstBeneficiary, 
            secondBeneficiary, 
            amountPerSingleUser
        );
        return true;
    }
}