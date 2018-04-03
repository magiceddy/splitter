import '../stylesheet/app.css';
import 'flexboxgrid/css/flexboxgrid.css';

const Splitter = require('../../build/contracts/Splitter.json');
const contract = require('truffle-contract');
const Web3 = require('web3'); 

let web3;
let accounts;
let currAddress;
let instance;

const splitter = contract(Splitter); 

window.App = {
    start: async function() {

        splitter.setProvider(web3.currentProvider);
        this.instance = await splitter.deployed();
        this.startConfig();
        this.registerEvents();
    },
    send: async function() {
        const sender = document.getElementById('coinbase').value;
        const ben1 = document.getElementById('firstBeneficiary').value;
        const ben2 = document.getElementById('secondBeneficiary').value;
        const amount = web3.toBigNumber(document.getElementById('amount').value);
        const amountInWei = web3.toWei(amount, 'ether');

        const txObject = await this.instance.split(ben1, ben2, { from: sender, value: amountInWei });
    },
    startConfig: function() {
        this.coinbase = web3.eth.coinbase;

        document.getElementById('coinbase').value = this.coinbase;

        return web3.version.network == 3 ? 
            this.configForRopsten() : 
            this.configForTestRpc();
    },
    configForRopsten: function() {},
    configForTestRpc: function() {
        this.accounts = web3.eth.accounts;

        document.getElementById('firstBeneficiary').value = this.accounts[1];
        document.getElementById('secondBeneficiary').value =this.accounts[2];
        document.getElementById('network').innerText = "Network: Local TestRpc";

        this.setBalance();
    },
    onAddressChange: function(event) {
        console.log(event);
    },
    setBalance: async function () {
        const senderBalanceInWei = await web3.eth.getBalance(this.coinbase);
        const firstBalanceInWei = await web3.eth.getBalance(this.accounts[1]);
        const secondBalanceInWei = await web3.eth.getBalance(this.accounts[2]);
        const senderBalance = web3.fromWei(senderBalanceInWei, 'ether').toString(10);
        const firstBalance = web3.fromWei(firstBalanceInWei, 'ether').toString(10);
        const secondBalance = web3.fromWei(secondBalanceInWei, 'ether').toString(10);

        document.getElementById('senderBalance').innerText = senderBalance + " ETH";
        document.getElementById('firstBalance').innerText = firstBalance + " ETH";
        document.getElementById('secondBalance').innerText = secondBalance + " ETH";
        
    },
    registerEvents: function() {
        const self = this;
        var event = self.instance.LogSplit({ fromBlock: 0, toBlock: 'latest'});

        event.watch(function(err, res) {
            if (!err) {
                self.setBalance();
            }
        });
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


