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

    describe('split function', async () => {

        describe('fail cases', async () => {

            it("should fail with 0 value", async () => {
                let hasSplit;
                
                try {
                    hasSplit = await instance.split(beneficiary1, beneficiary2, { from: owner });
                } catch (e) {
                    assert.include(e.message, 'revert', 'no revert with 0 value call');
                    assert.isUndefined(hasSplit, 'with 0 value split return something');
                }
            });

        });
    });
});