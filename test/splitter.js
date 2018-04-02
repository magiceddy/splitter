const Promise = require('bluebird');
const Splitter = artifacts.require("./Splitter.sol");

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

const bigNumberConverter = _bigNumber => 
    web3.toBigNumber(_bigNumber).toString(10);

contract('Splitter', async accounts => {

    // addresses
    const sender = accounts[0];
    const firstBeneficiary = accounts[1];
    const secondBeneficiary = accounts[2];

    // balances
    const senderInitialBalance = bigNumberConverter(web3.eth.getBalance(sender));

    console.log(senderInitialBalance);

    let instance;
    let hasSplit;

    beforeEach(async () => {
        instance = await Splitter.deployed();
        hasSplit = undefined;
    });

    it('should set the correct owner', async () => {
        const contractOwner = await instance.owner();
        assert.strictEqual(sender, contractOwner, 'The creator is not the owner');
    });

    describe('split function', async () => {

        describe('fail cases', async () => {

            it("should fail with 0 value", async () => {                
                try {
                    hasSplit = await instance.split(firstBeneficiary, secondBeneficiary, { from: sender });
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert with 0 value');
                    assert.isUndefined(hasSplit, 'with 0 value split return something');
                }
            });

            it('should fail with odd value', async () => {
                try {
                    hasSplit = await instance.split(firstBeneficiary, secondBeneficiary, { value: 3 });
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert with odd value');
                    assert.isUndefined(hasSplit, 'with odd value split return something');
                }
            });

            it('should fail if sender is firstBeneficiary', async() => {
                try {
                    hasSplit = await instance.split(firstBeneficiary, secondBeneficiary, { value: 2, from: firstBeneficiary });
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert if sender is the first beneficiary');
                    assert.isUndefined(hasSplit, 'if sender is the first beneficiary split return something');
                }
            });

            it('should fail if sender is secondBeneficiary', async() => {
                try {
                    hasSplit = await instance.split(firstBeneficiary, secondBeneficiary, { value: 2, from: secondBeneficiary });
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert if sender is the second beneficiary');
                    assert.isUndefined(hasSplit, 'if sender is the second beneficiary split return something');
                }
            });

            it('should fail if firstBeneficiary is secondBeneficiary', async() => {
                try {
                    hasSplit = await instance.split(firstBeneficiary, firstBeneficiary, { value: 2, from: sender });
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert if firstBeneficiary is secondBeneficiary');
                    assert.isUndefined(hasSplit, 'if firstBeneficiary is secondBeneficiary split return something');
                }
            });
        });

        describe('success case', async () => {

            const value = 10;
            let txObject;

            beforeEach(async () => {
                txObject = await instance.split(firstBeneficiary, secondBeneficiary, { value, from: sender });
            });
            
            it('should return true', async () => {
                hasSplit = await instance.split.call(firstBeneficiary, secondBeneficiary, { value, from: sender });
                assert.isTrue(hasSplit, 'split doesn\' return true');
            });

            it('should log LogSplit', async () => {
                const logs = txObject.logs;
                const firstLogArgs = logs[0].args;
                const amountPerSingleUser = bigNumberConverter(firstLogArgs.amount);

                assert.strictEqual(logs.length, 1, 'incorrect number of logs');
                assert.strictEqual(firstLogArgs.from, sender, 'sender is not correct in log');
                assert.strictEqual(firstLogArgs.firstBeneficiary, firstBeneficiary, 'firstBeneficiary is not correct in log');
                assert.strictEqual(firstLogArgs.secondBeneficiary, secondBeneficiary, 'secondBeneficiary is not correct in log');
                assert.equal(amountPerSingleUser, value / 2, 'amount per single user is incorrect');
            });

            it('should update balances', async () => {

            });
        });
    });
});