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

    it('should refund in case of creation with value', async () => {
        const initialSenderBalance = await web3.eth.getBalance(sender);
        const ValueInstance = await Splitter.new({ value: 10 });
        const balance = await web3.eth.getBalance(ValueInstance.address);
        const currentSenderBalance = await web3.eth.getBalance(sender);

        const txObject = web3.eth.getTransactionReceipt(ValueInstance.transactionHash);

        const gasUsed = txObject.gasUsed;
        const transaction = await web3.eth.getTransaction(ValueInstance.transactionHash);
        const gasPrice = transaction.gasPrice;
        const txFee = gasPrice.times(gasUsed);

        assert.equal(balance, 0, 'contract has balance after creation');
        assert.equal(currentSenderBalance.plus(txFee).toString(10), initialSenderBalance, 'sender was not refund');
    });

    describe('split function', async () => {

        describe('fail cases', async () => {

            it("should fail with 0 value", async () => {                
                try {
                    hasSplit = await instance.split(firstBeneficiary, secondBeneficiary, { from: sender });
                    assert.isUndefined(hasSplit, 'with 0 value split return something');
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert with 0 value');
                }
            });

            it('should fail with odd value', async () => {
                try {
                    hasSplit = await instance.split(firstBeneficiary, secondBeneficiary, { value: 3 });
                    assert.isUndefined(hasSplit, 'with odd value split return something');
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert with odd value');
                }
            });

            it('should fail if sender is firstBeneficiary', async() => {
                try {
                    hasSplit = await instance.split(firstBeneficiary, secondBeneficiary, { value: 2, from: firstBeneficiary });
                    assert.isUndefined(hasSplit, 'if sender is the first beneficiary split return something');
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert if sender is the first beneficiary');
                }
            });

            it('should fail if sender is secondBeneficiary', async() => {
                try {
                    hasSplit = await instance.split(firstBeneficiary, secondBeneficiary, { value: 2, from: secondBeneficiary });
                    assert.isUndefined(hasSplit, 'if sender is the second beneficiary split return something');
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert if sender is the second beneficiary');
                }
            });

            it('should fail if firstBeneficiary is secondBeneficiary', async() => {
                try {
                    hasSplit = await instance.split(firstBeneficiary, firstBeneficiary, { value: 2, from: sender });
                    assert.isUndefined(hasSplit, 'if firstBeneficiary is secondBeneficiary split return something');
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert if firstBeneficiary is secondBeneficiary');
                }
            });

            it('should fail if firstBeneficiary is not present', async() => {
                try {
                    hasSplit = await instance.split('0x00', secondBeneficiary, { value: 2, from: sender });
                    assert.isUndefined(hasSplit, 'if firstBeneficiary is not present split return something');
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert if firstBeneficiary is secondBeneficiary');
                }
            });

            it('should fail if secondBeneficiary is not present', async() => {
                try {
                    hasSplit = await instance.split(firstBeneficiary, '0x00', { value: 2, from: sender });
                    assert.isUndefined(hasSplit, 'if firstBeneficiary is not present split return something');
                } catch (err) {
                    assert.include(err.message, 'revert', 'no revert if firstBeneficiary is secondBeneficiary');
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

    describe('kill function', async () => {

        describe('fail case', async () => {

            it('should fail on no owner call', async () => {
                try {
                    const hasKill = await instance.kill({ from: firstBeneficiary });
                    assert.isUndefined(hasKill, 'anyone can kill my contract')
                } catch(err) {
                    assert.include(err.message, 'revert', 'no revert if anyone kill my contract');
                }
            });
        });

        describe('success case', async () => {

            it('owner can kill my contract', async () => {
                await instance.kill({ from: sender });
                const owner = await instance.owner();
                assert.equal(owner, '0x0', 'kill was not performed');
            })
        });
    });
});