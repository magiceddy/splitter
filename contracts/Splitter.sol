pragma solidity 0.4.19;


contract Splitter {

    address public owner;

    modifier noAutoSend(address _address) {
        require(_address != msg.sender);
        _;
    }

    modifier noEmptyAddress(address _address) {
        require(_address != address(0x00));
        _;
    }

    modifier noHomonymy(address first, address second) {
        require(first != second);
        _;
    }

    event LogSplit(
        address indexed from, 
        address indexed firstBeneficiary, 
        address indexed secondBeneficiary,
        uint256 amount
    );

    function Splitter() public payable {
        owner = msg.sender;
        if (msg.value > 0) {
            owner.transfer(msg.value);
        }
    }

    function split(address firstBeneficiary, address secondBeneficiary)
        public
        payable
        noAutoSend(firstBeneficiary)
        noAutoSend(secondBeneficiary)
        noEmptyAddress(firstBeneficiary)
        noEmptyAddress(secondBeneficiary)
        noHomonymy(firstBeneficiary, secondBeneficiary)
        returns (bool) 
    {
        require(msg.value > 0);
        require(msg.value % 2 == 0);
        
        uint256 amountPerSingleUser = msg.value / 2;
        
        firstBeneficiary.transfer(amountPerSingleUser);
        secondBeneficiary.transfer(amountPerSingleUser);

        assert(address(this).balance == 0);
        
        LogSplit(
            msg.sender, 
            firstBeneficiary, 
            secondBeneficiary, 
            amountPerSingleUser
        );
        return true;
    }

    function kill() public {
        require(msg.sender == owner);
        selfdestruct(owner);
    }

    function() public {}
}