const {
  db,
} = require('../helpers');
const config = require('../config')
const axios = require('axios');

const sync = {

  async start() {
    // get current latest block height from the DB
    let searchBlock = await sync.getLatestBlock()
    console.log(searchBlock)
    if(!searchBlock) {
      //first time run, need it to be set to 0
      searchBlock = 0
    }

    while (true) {
      searchBlock = parseInt(searchBlock) + 1
      const response = await sync.syncBlock(searchBlock)
      await sync.sleep(10)

      if(!response) {
        await sync.sleep(10000)
      }
    }
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async getLatestBlock() {
    const response = await db.oneOrNone('select max(height) as max_block from explorer_blocks;')
    return response.max_block
  },

  async syncBlock(blockHeight) {
    // console.log('Syncing block - '+blockHeight)
    try {
      const blockData = await sync.getBlock(blockHeight)
      if(blockData.error) {
        return false
      }

      const transactionResponse = await sync.getTransactionsForBlock(blockData, 1, [])

      return true
    } catch(ex) {
      console.log(ex)
      //TODO: handle exception
    }
  },

  async getBlock(blockHeight) {
    try {
      const url = config.zarApi + '/blocks/'+blockHeight
      const apiRes = await axios.get(url);
      const blockData = apiRes.data

      if(blockData.error) {
        return blockData
      }

      const insertResponse = await sync.insertBlock(blockData)

      return blockData
    } catch(ex) {
      console.log(ex)
      throw ex
      //TODO: handle exception
    }
  },

  async insertBlock(blockData) {
    try {
      const blockHash = blockData.block_meta.block_id.hash
      const blockHeight = blockData.block_meta.header.height
      const txCount = blockData.block_meta.header.num_txs
      const parentBlockHash = blockData.block_meta.header.last_block_id.hash
      const proposerAddress = blockData.block_meta.header.proposer_address
      const blockTimestamp = blockData.block_meta.header.time

      const insertResponse = await db.none('insert into explorer_blocks (block_hash, raw, height, tx_count, parent_block_hash, block_proposer_address, block_timestamp) values ($1, $2, $3, $4, $5, $6, $7);',
      [blockHash, blockData, blockHeight, txCount, parentBlockHash, proposerAddress, blockTimestamp])

      return insertResponse
    } catch (ex) {
      console.log(ex)
      throw ex
      //TODO: handle exception
    }
  },

  async getTransactionsForBlock(blockData, page, transactions) {
    try {
      const blockHeight = blockData.block_meta.header.height

      const url = config.zarApi + '/txs?tx.height='+blockHeight+'&page='+page
      const apiRes = await axios.get(url);
      const transactionsData = apiRes.data

      //add transactions to list
      transactions = transactions.concat(transactionsData.txs)

      //checck if more pages, then do the call
      if(page < transactionsData.page_total) {
        await sync.getTransactionsForBlock(blockData, page, transactions)
      } else {
        //if on the final page, insert transactions
        await sync.insertTransactions(transactions, blockData)
      }

      return true
    } catch(ex) {
      console.log(ex)
      throw ex
      //TODO: handle exception
    }
  },

  async insertTransactions(transactions, blockData) {
    const response = transactions.map(async (transaction) => {
      try {
        return await sync.insertTransaction(transaction, blockData)
      } catch (ex) {
        console.log(ex)
        return ex
      }
    })

    return true
  },

  async insertTransaction(transaction, blockData) {
    try {
      const transactionHash = transaction.txhash
      const blockHeight = transaction.height
      const blockHash = blockData.block_meta.block_id.hash
      const gasWanted = transaction.gas_wanted
      const gasUsed = transaction.gas_used
      const transactionType = transaction.tx.type
      const transactionTimestamp = transaction.timestamp
      const messageType = transaction.tx.value.msg[0].type

      let from = null
      let to = null
      let amount = null
      let memo = null

      if(messageType === 'cosmos-sdk/MsgSend') {
        from = transaction.tx.value.msg[0].value.from_address
        to = transaction.tx.value.msg[0].value.to_address
        amount = transaction.tx.value.msg[0].value.amount[0].amount
        denom = transaction.tx.value.msg[0].value.amount[0].denom
        memo = transaction.tx.value.memo
      } else {
        console.log(messageType)
      }

      const insertResponse = await db.none('insert into explorer_transactions (tx_hash, raw, block_height, block_hash, gas_wanted, gas_used, tx_type, message_type, from_address, to_address, amount, denom, memo, tx_timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);',
      [transactionHash, transaction, blockHeight, blockHash, gasWanted, gasUsed, transactionType, messageType, from, to, amount, denom, memo, transactionTimestamp])

      return insertResponse
    } catch (ex) {
      console.log(ex)
      throw ex
      //TODO: handle exception
    }
  },
}

module.exports = sync
