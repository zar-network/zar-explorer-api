const express = require('express')
const router = express.Router()

const {
  blocks,
  transactions,
  addresses,
  proxy
} = require('../models')

router.get('/api/v1/blocks', blocks.getBlocks)
router.get('/api/v1/blocks/{block_id}', blocks.getBlock)

router.get('/api/v1/address/{address_id}', addresses.getAddress)

router.get('/api/v1/transactions', transactions.getTransactions)
router.get('/api/v1/transactions/{transaction_id}', transactions.getTransaction)

router.get('/blocks/latest', proxy.blocksLatest)
router.get('/blocks/list', proxy.blocksList)
router.get('/block/:height', proxy.blocks)
router.get('/txs/list', proxy.txsList)
router.get('/tx/:hash', proxy.txs)
router.get('/auth/accounts/:hash', proxy.getAddress)
router.get('/issue/list', proxy.getIssueLIst)

module.exports = router
