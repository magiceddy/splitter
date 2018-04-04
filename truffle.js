module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 500000
    },
    'net42': {
      host: 'localhost',
      port: 8545,
      network_id: 42,
      gas: 400000
    },
    'ropsten': {
      host: 'localhost',
      port: 8545,
      network_id: 3
    }
  }
};
