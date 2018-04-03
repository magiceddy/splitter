import '../stylesheet/app.css';
import 'flexboxgrid/css/flexboxgrid.css';

const Splitter = require('../../build/contracts/Splitter.json');
const contract = require('truffle-contract');
const Web3 = require('web3'); 

let accounts;
let currAddress;
let instance;

const splitter = contract(Splitter); 

window.App = {
    start: async function() {

        this.startConfig();
        splitter.setProvider(web3.currentProvider);
        instance = await splitter.deployed();
    },
    send: async function() {
        const sender = document.getElementById('coinbase').value;
        const ben1 = document.getElementById('firstBeneficiary').value;
        const ben2 = document.getElementById('secondBeneficiary').value;
        const amount = web3.toBigNumber(document.getElementById('amount').value);
        const amountInWei = web3.toWei(amount, 'ether');

        let txObject = await instance.split(ben1, ben2, { from: sender, value: amountInWei });
    },
    startConfig: function() {
        this.coinbase = web3.eth.coinbase;

        document.getElementById('coinbase').value = this.coinbase;
        document.getElementById('amount').value = '';

        return web3.version.network == 3 ? 
            self.configForRopsten() : 
            this.configForTestRpc();
    },
    configForRopsten: function() {},
    configForTestRpc: function() {
        accounts = web3.eth.accounts;
        document.getElementById('firstBeneficiary').value = accounts[1];
        document.getElementById('secondBeneficiary').value = accounts[2];
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


