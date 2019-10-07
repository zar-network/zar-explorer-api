const config = require('../config')
const axios = require('axios');
var asyncLib = require("async");

const proxy = {

  async blocksLatest(req, res, next) {
    const url = config.zarApi + '/blocks/latest'
    const apiRes = await axios.get(url);
    res.status(200)
    res.body = apiRes.data
    return next(null, req, res, next)
  },

  async blocksList(req, res, next) {
    const url = config.zarApi + '/blocks/latest'
    const apiRes = await axios.get(url);

    let offset = 0

    const index = req.query.page_index

    if(index != null) {
      offset = 10*(index-1)
    }

    let end = parseInt(apiRes.data.block_meta.header.height)
    end = end - offset
    const start = end-10
    const heights = Array(end - start).fill().map((_, idx) => start + idx).reverse()

    asyncLib.mapLimit(heights, 10, async function(height) {
      if(height < 1) {
        return null
      }
      const fetchURL = config.zarApi + '/blocks/'+height
      const response = await axios.get(fetchURL)
      return response.data.block
    }, (err, results) => {
      console.log(err)
      if (err) throw err
      // results is now an array of the response bodies
      res.status(200)
      res.body = results
      return next(null, req, res, next)
    })
  },

  async blocks(req, res, next) {
    const url = config.zarApi + '/blocks/'+req.params.height
    const apiRes = await axios.get(url);
    res.status(200)
    apiRes.data.block.header.blockhash = apiRes.data.block_meta.block_id.hash
    res.body = apiRes.data.block
    return next(null, req, res, next)
  },

  async txsList(req, res, next) {
    let url = config.zarApi + '/txs'

    let list = false

    const {
      height,
      page_size,
      page_index,
      address
    } = req.query

    if(height) {
      url = url+'?tx.height='+height
    } else if(address) {
      url = url+'?message.sender='+address
      //url = url+'?transfer.recipient='+address
    } else {
      list = true
      url = url+'?message.action=send'
    }

    if(page_size) {
      url= url+'&limit='+page_size
    } else {
      url= url+'&limit=10'
    }

    if(page_index) {
      url= url+'&page='+page_index
    } else {
      url= url+'&page=1'
    }

    if(!list) {
      const apiRes = await axios.get(url);
      res.status(200)
      res.body = apiRes.data.txs
      return next(null, req, res, next)
    } else {
      asyncLib.parallel([
        function(callback) {
          const sendURL = config.zarApi + '/txs?message.action=send&limit=10&page=1'
          axios.get(sendURL)
            .then((apiRes) => {
              callback(null, apiRes)
            });
        },
        function(callback) {
          const sendURL = config.zarApi + '/txs?message.action=issue&limit=10&page=1'
          axios.get(sendURL)
            .then((apiRes) => {
              callback(null, apiRes)
            });
        }
      ], (err, data) => {
        const newArray = data[0].data.txs.concat(data[1].data.txs)
        const sortedArr = newArray.sort(function(a, b){
          return a.timestamp > b.timestamp;
        });

        res.status(200)
        res.body = sortedArr
        return next(null, req, res, next)

      })
    }
  },

  async txs(req, res, next) {
    const url = config.zarApi + '/txs/'+req.params.hash
    const apiRes = await axios.get(url);
    res.status(200)
    res.body = apiRes.data
    return next(null, req, res, next)
  },

  async getAddress(req, res, next) {
    const url = config.zarApi + '/auth/accounts/'+req.params.hash
    const apiRes = await axios.get(url);
    res.status(200)
    res.body = apiRes.data
    return next(null, req, res, next)
  },

  async getIssueLIst(req, res, next) {
    const url = config.zarApi + '/issue/list'
    const apiRes = await axios.get(url);
    res.status(200)
    res.body = apiRes.data
    return next(null, req, res, next)
  }
}

module.exports = proxy
