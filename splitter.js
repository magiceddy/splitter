const Splitter = require('./build/contracts/Splitter.json');
const contract = require('truffle-contract');
const Web3 = require('web3');

if(typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);
} else {
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}




const splitter = contract(Splitter);
splitter.setProvider(web3.currentProvider);
const pp = async () => await splitter.deployed();
let instance = pp();
//splitter.deployed().then(_instance => console.log(_instance));
console.log(instance);