const Splitter = require('../../build/contracts/Splitter.json');
const contract = require('truffle-contract');
const Web3 = require('web3');

if(typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);
} else {
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

console.log('ciaoooo');

const accounts = web3.eth.accounts;
const currAddress = web3.eth.coinbase;
const splitter = contract(Splitter); 

window.App = {
    start: function() {
        const self = this;

        splitter.setProvider(web3.currentProvider);
    },
    send: function() {
        console.log('ciaooooo');
    }
};


