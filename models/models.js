const Addresses = require('./addresses.js');
const Blocks = require('./blocks.js');
const Transactions = require('./transactions.js');
const Proxy = require('./proxy.js');

const models = {
  addresses: Addresses,
  blocks: Blocks,
  transactions: Transactions,
  proxy: Proxy
}

module.exports = models
