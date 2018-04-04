import '../stylesheet/app.css';
import 'flexboxgrid/css/flexboxgrid.css';

const Splitter = require('../../build/contracts/Splitter.json');
const contract = require('truffle-contract');
const Web3 = require('web3'); 

let web3 = window.web3;

window.App = {
    start: function () {
        this.networkId = web3.version.network;
        this.setNetworkLabel();
        this.initializeContract();
        this.setInitialAddresses();
        this.setBalance();
        this.setAmount();
        this.tryAbleSend();
    },
    initializeContract: async function() {
        this.splitter = contract(Splitter);
        this.splitter.setProvider(web3.currentProvider);

        if (this.networkId == 3) {
            const splitterAddress = "0x24b299e594d6AFFFBd47467Fe99BaF7b4c7d9115";
            this.instance = this.splitter.at(splitterAddress);
        } else {
            this.instance = await this.splitter.deployed();
        }
    },
    setInitialAddresses: function() {
        this.setSender();
        this.setBeneficiaries();
    },
    setSender: function() {
        this.sender = web3.eth.coinbase;
        document.getElementById('coinbase').innerHTML = this.sender;
    },
    setBeneficiaries: function() {
        const accountsFromUI = this.getCurrentAddressiesFromUi();
        const accounts = web3.eth.accounts;
        const firstBen = accounts[1] || accountsFromUI.firstBeneficiary || false;
        const secondBen = accounts[2] || accountsFromUI.secondBeneficiary || false;

        if (firstBen) {
            document.getElementById('firstBeneficiary').value = firstBen;
        }
        if (secondBen) {
            document.getElementById('secondBeneficiary').value = secondBen;
        }
    },
    setBalance: function() {
        const addresses = this.getCurrentAddressiesFromUi();

        if (addresses.sender) {
            web3.eth.getBalance(addresses.sender, function(err, _balance) {
                if (err) {
                    console.error(err);
                } else {
                    const senderBalance = web3.fromWei(_balance, 'ether').toString(10);
                    document.getElementById('senderBalance').innerText = senderBalance + " ETH";
                }
            });  
        }

        if (addresses.firstBeneficiary) {
            web3.eth.getBalance(addresses.firstBeneficiary, function(err, _balance) {
                if (err) {
                    console.error(err);
                } else {
                    const firstBalance = web3.fromWei(_balance, 'ether').toString(10);
                    document.getElementById('firstBalance').innerText = firstBalance + " ETH";
                }
            }); 
        }

        if (addresses.secondBeneficiary) {
            web3.eth.getBalance(addresses.secondBeneficiary, function(err, _balance) {
                if (err) {
                    console.error(err);
                } else {
                    const secondBalance = web3.fromWei(_balance, 'ether').toString(10);
                    document.getElementById('secondBalance').innerText = secondBalance + " ETH";
                }
            });
        }
        this.tryAbleSend();
    },
    getCurrentAddressiesFromUi: function() {
        return {
            sender: this.chekAddressesValidity(document.getElementById('coinbase').innerHTML),
            firstBeneficiary: this.chekAddressesValidity(document.getElementById('firstBeneficiary').value),
            secondBeneficiary: this.chekAddressesValidity(document.getElementById('secondBeneficiary').value)
        }
    },
    chekAddressesValidity: function(_address) {
        return web3.isAddress(_address) ? _address : false;
    },
    send: async function() {
        const addresses = this.getCurrentAddressiesFromUi();
        
        if (this.sendAbled) {
            this.toggleLoaderVisibility();
            const txObject = await this.instance.split(
                addresses.firstBeneficiary, addresses.secondBeneficiary, 
                { from: addresses.sender, value: this.amountInWei }
            );
            this.toggleLoaderVisibility();
            location.reload();        }
    },
    sendAbled: function() {
        const addresses = this.getCurrentAddressiesFromUi();
        return addresses.sender && addresses.firstBeneficiary && 
            addresses.secondBeneficiary && this.amountInWei   ?
            true : false;
    },
    setAmount: function() {
        try {
            const amount = web3.toBigNumber(document.getElementById('amount').value);
            this.amountInWei = web3.toWei(amount, 'ether');
            this.tryAbleSend();
        } catch(err) {
            document.getElementById('amount').value = "insert an Ethereum value";
        };
    },
    tryAbleSend: function() {
        const abled = this.sendAbled();
        document.getElementById('sendButton').disabled = !abled;
    },
    onAddressChange: function(event) {
        if (this.chekAddressesValidity(event.value)) {
            this.setBalance();
        } else {
            document.getElementById(event.id).value = "Indirizzo non corretto";
        }
    },
    registerEvents: function() {
        const self = this;
        var event = self.instance.LogSplit({ fromBlock: 0, toBlock: 'latest'});
        
        event.watch(function(err, res) {
            if (err) {
                console.log('ciao');
                console.error(err);
            }
        });
    },
    toggleLoaderVisibility: function() {
        const style = window.getComputedStyle(document.getElementById('loader'));
        
        if (style.visibility == 'hidden') {
            document.getElementById('loader').style.visibility = 'visible';
        } else {
            document.getElementById('loader').style.visibility = 'hidden';
        }
    },
    setNetworkLabel: function() {
        const networkEl = document.getElementById('network');
        let text;
        let color;

        if (this.network === 3) {
            text = 'Ropsten';
            color = 'red';
        } else {
            text = 'TestRpc';
            color = 'black';
        }

        networkEl.innerText = `Network: ${text}`;
        networkEl.style.color = color;
    }
};

window.addEventListener('load', function() {
    if(typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    App.start();
})


