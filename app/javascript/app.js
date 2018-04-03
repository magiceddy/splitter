const Splitter = require('../../build/contracts/Splitter.json');
const contract = require('truffle-contract');
const Web3 = require('web3');

let accounts;
let currAddress;
let instance;

const splitter = contract(Splitter); 

window.App = {
    start: async function() {
        const self = this;
        accounts = web3.eth.accounts;
        coinbase = web3.eth.coinbase;

        console.log(web3.currentProvider);
        splitter.setProvider(web3.currentProvider);
        instance = await splitter.deployed();
    },
    send: async function() {
        let txObject = await instance.split(accounts[1], accounts[2], { from: coinbase, value: 10 });
        console.log(txObject);
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


