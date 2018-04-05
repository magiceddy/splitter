pragma solidity 0.4.19;

contract Splitter {

    address public owner;
    bool private alreadyPaid;

    event LogSplit(
        address indexed from, 
        address indexed firstBeneficiary, 
        address indexed secondBeneficiary,
        uint256 amount
    );

    function Splitter() public {
        owner = msg.sender;
    }

    function split(address firstBeneficiary, address secondBeneficiary)
        public
        payable
        returns (bool) 
    {

        if (!safeBeneficiaries(firstBeneficiary, secondBeneficiary)) {
            revert();
        } else if (!noSelfPay(firstBeneficiary, secondBeneficiary)) {
            revert();
        } else if (!safeAmount(msg.value) ) {
            revert();
        }

        uint256 amountPerSingleUser = msg.value / 2;

        pay(firstBeneficiary, amountPerSingleUser);
        pay(secondBeneficiary, amountPerSingleUser);

        assert(address(this).balance == 0);
        
        LogSplit(
            msg.sender, 
            firstBeneficiary, 
            secondBeneficiary, 
            amountPerSingleUser
        );
        return true;
    }

    function pay(address beneficiary, uint amount) private {
        if(!alreadyPaid) {
            alreadyPaid = true;
            beneficiary.transfer(amount);
            alreadyPaid = false;
        }
    } 

    function safeBeneficiaries(address a, address b) private pure returns (bool) {
        require(a != b);
        require(a != address(0x00) && b != address(0x00));
        return true;
    }

    function noSelfPay(address a, address b) private view returns (bool) {
        require(a != msg.sender && b != msg.sender);
        return true;
    }

    function safeAmount(uint256 amount) private pure returns (bool) {
        require(amount > 0);
        require(amount % 2 == 0);
        return true;
    }

    function kill(address refund) public returns (bool) {
        require(msg.sender == owner);
        selfdestruct(refund);
        return true;
    }

    function() public {}
}