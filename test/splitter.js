const Promise = require('bluebird');
const Splitter = artifacts.require("./Splitter.sol");

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract('Splitter', async accounts => {

    let instance;

    const owner = accounts[0];
    const beneficiary1 = accounts[1];
    const beneficiary2 = accounts[2];

    beforeEach(async () => 
        instance = await Splitter.deployed()
    );

    it('should set the correct owner', async () => {
        const contractOwner = await instance.owner();
        assert.strictEqual(owner, contractOwner, 'The creator is not the owner');
    });




    
});