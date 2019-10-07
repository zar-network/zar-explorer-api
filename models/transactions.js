const {
  db,
} = require('../helpers');

const transactions = {

  async getTransactions(req, res, next) {

    const {
      sort,
      limit,
      page,
      block_hash,
      address
    } = req.query

    let querySort = 'order by tx_timestamp desc '
    let queryLimit = 'limit 10 '
    let queryPage = 'offset 0 '
    let blockHashQuery = "and block_hash = '"+block_hash+"' "
    let addressQuery = "and from_address = '"+address+"' or to_address = '"+address+"' "

    if(sort) {
      const sortArr = sort.split(',')

      if(sortArr.length == 1) {
        querySort = ' order by '+sort+' asc'
      } else if (sortArr.length == 2 && ['asc', 'desc'].includes(sortArr[1])) {
        querySort = ' order by '+sortArr[0]+' '+sortArr[1]
      }
    }

    if(limit && !isNaN(limit) && limit < 100) {
      queryLimit = 'limit '+limit
    }

    if(page && !isNaN(page)) {
      queryPage = 'limit '+page
    }

    try {
      const transactions = await db.manyOrNone('select * from explorer_transactions where 1=1 '+blockHashQuery+addressQuery+querySort+queryLimit+queryPage)

      res.status(205)
      res.body = { 'status': 200, 'success': success, 'transactions': transactions }
      return next(null, req, res, next)

    } catch (ex) {
      console.log(ex)
      res.status(500)
      res.body = { 'status': 500, 'success': false, 'result': ex }
      return next(null, req, res, next)
    }
  },

  async getTransaction(req, res, next) {
    const {
      tx_hash
    } = req.query

    try {
      const transaction = await db.oneOrNone('select * from explorer_transactions where tx_hash = $1;', [tx_hash])

      res.status(205)
      res.body = { 'status': 200, 'success': success, 'transaction': transaction }
      return next(null, req, res, next)

    } catch (ex) {
      console.log(ex)
      res.status(500)
      res.body = { 'status': 500, 'success': false, 'result': ex }
      return next(null, req, res, next)
    }
  }

}

module.exports = transactions
