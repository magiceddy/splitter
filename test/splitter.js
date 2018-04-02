const Promise = require('bluebird');
const Splitter = artifacts.require("./Splitter.sol");

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract('Splitter', async accounts => {

    // addresses
    const sender = accounts[0];
    const firstBeneficiary = accounts[1];
    const secondBeneficiary = accounts[2];

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
            const amountPerSingleUser = value / 2;

            describe('call', async () => {

                it('should return true', async () => {
                    gas = web3.eth.estimateGas(instance.split.call(firstBeneficiary, secondBeneficiary, { value, from: sender }))
                    hasSplit = await instance.split.call(firstBeneficiary, secondBeneficiary, { gas, value, from: sender });
                    
                    assert.isTrue(hasSplit, 'split doesn\' return true');
                });
            });

            describe('transaction', async () => {
                
                it('should have correct balances', async () => {

                    // initial balances
                    const initialSenderBalance = await web3.eth.getBalance(sender);
                    const initialFirstBeneficiaryBalance = await web3.eth.getBalance(firstBeneficiary);
                    const initialSecondBeneficiaryBalance = await web3.eth.getBalance(secondBeneficiary);

                    const txObject = await instance.split(firstBeneficiary, secondBeneficiary, { value, from: sender });
                    
                    // calculate txFee
                    const gasUsed = txObject.receipt.gasUsed;
                    const transaction = await web3.eth.getTransaction(txObject.tx);
                    const gasPrice = transaction.gasPrice;
                    const txFee = gasPrice.times(gasUsed);
    
                    // current balances
                    const currentSenderBalance = await web3.eth.getBalance(sender);
                    const currentFirstBeneficiaryBalance = await web3.eth.getBalance(firstBeneficiary);
                    const currentSecondBeneficiaryBalance = await web3.eth.getBalance(secondBeneficiary);
                    const currentInstanceBalance = await web3.eth.getBalance(instance.address);
                    
                    assert.equal(currentInstanceBalance, 0, 'Splitter has no 0 balance');                    
                    assert.equal(
                        currentSenderBalance.plus(txFee).plus(value).toString(10), 
                        initialSenderBalance,
                        'transfered more than value'
                    );
                    assert.equal(
                        currentFirstBeneficiaryBalance.minus(amountPerSingleUser).toString(10),
                        initialFirstBeneficiaryBalance,
                        'first beneficiary hasn\'t correct balance'
                    );
                    assert.equal(
                        currentSecondBeneficiaryBalance.minus(amountPerSingleUser).toString(10),
                        initialSecondBeneficiaryBalance,
                        'second beneficiary hasn\'t correct balance'
                    );
                });

                it('should log LogSplit', async () => {
                    const txObject = await instance.split(firstBeneficiary, secondBeneficiary, { value, from: sender });
                    const logs = txObject.logs;
                    const firstLogArgs = logs[0].args;
                    const amountPerSingleUser = web3.toBigNumber(firstLogArgs.amount).toString(10);
    
                    assert.strictEqual(logs.length, 1, 'incorrect number of logs');
                    assert.strictEqual(firstLogArgs.from, sender, 'sender is not correct in log');
                    assert.strictEqual(firstLogArgs.firstBeneficiary, firstBeneficiary, 'firstBeneficiary is not correct in log');
                    assert.strictEqual(firstLogArgs.secondBeneficiary, secondBeneficiary, 'secondBeneficiary is not correct in log');
                    assert.equal(amountPerSingleUser, amountPerSingleUser, 'amount per single user is incorrect');
                });
            });
        });
    });
});