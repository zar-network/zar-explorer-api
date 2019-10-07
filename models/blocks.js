const {
  db,
} = require('../helpers');

const blocks = {

  async getBlocks(req, res, next) {

    const {
      sort,
      limit,
      page
    } = req.query

    let querySort = 'order by block_timestamp desc'
    let queryLimit = 'limit 10'
    let queryPage = 'offset 0'

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
      const blocks = await db.manyOrNone('select * from explorer_blocks '+querySort+queryLimit+queryPage)

      res.status(205)
      res.body = { 'status': 200, 'success': success, 'blocks': blocks }
      return next(null, req, res, next)

    } catch (ex) {
      console.log(ex)
      res.status(500)
      res.body = { 'status': 500, 'success': false, 'result': ex }
      return next(null, req, res, next)
    }
  },

  async getBlock(req, res, next) {
    const {
      block_height,
      block_hash
    } = req.query

    try {
      const block = await db.oneOrNone('select * from explorer_blocks where height = $1 or block_hash = $2;', [block_height, block_hash])

      res.status(205)
      res.body = { 'status': 200, 'success': success, 'block': block }
      return next(null, req, res, next)

    } catch (ex) {
      console.log(ex)
      res.status(500)
      res.body = { 'status': 500, 'success': false, 'result': ex }
      return next(null, req, res, next)
    }
  }

}

module.exports = blocks
