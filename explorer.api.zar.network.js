const express = require('express')
const compression = require('compression')
const morgan = require('morgan')
const helmet = require('helmet')
const https = require('https')
const auth = require('http-auth')
const bodyParser = require('body-parser')
const routes  = require('./routes')
const sync = require('./sync')

/*  RkNFQzg3NUUzMjE4MDI4RTkwQTIyNjdGQzlEMzVGNzExOTI5MUU0RTQ4MkM5RTdBRTkzOThCQzkzMzkzMjJGRToxMjQ2RjlCQ0E4MjdFRkIxQkY0REFGNDAwREE5MkE4QUQzNjk5NEZENDUzNEEyNkFDQTg2RDM4M0QyRkY4QjVC */
var basic = auth.basic({ realm: 'explorer.api.zar.network' }, function (username, password, callback) {
  callback(username === 'FCEC875E3218028E90A2267FC9D35F7119291E4E482C9E7AE9398BC9339322FE' && password === '1246F9BCA827EFB1BF4DAF400DA92A8AD36994FD4534A26ACA86D383D2FF8B5B')
})

var app = express()

app.all('/*', function(req, res, next) {
  // CORS headers
  res.set('Content-Type', 'application/json')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST,OPTIONS')
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization,Username,Password,Signature,X-Access-Token,X-Key')
  if (req.method == 'OPTIONS') {
    res.status(200).end()
  } else {
    next()
  }
})

app.use(bodyParser.json());

app.use(morgan('dev'))

app.use(auth.connect(basic))
app.use(helmet())
app.use(compression())

app.use('/', routes)

function handleData(req, res) {
  res.set('Content-Type', 'application/json')
  res.setHeader('Content-Type', 'application/json')

  if (res.statusCode === 205 || res.statusCode === 204) {
    if (res.body) {
      if (res.body.length === 0) {
        res.status(200)
        res.json({
          'status': 204,
          'result': 'No Content'
        })
      } else {
        res.status(200)
        res.json(res.body)
      }
    } else {
      res.status(200)
      res.json({
        'status': 204,
        'result': 'No Content'
      })
    }
  } else if (res.statusCode === 400) {
    res.status(res.statusCode)
    if (res.body) {
      res.json(res.body)
    } else {
      res.json({
        'status': res.statusCode,
        'success': false,
        'result': 'Bad Request'
      })
    }

  } else if (res.statusCode === 401) {
    res.status(res.statusCode)
    if (res.body) {
      res.json(res.body)
    } else {
      res.json({
        'status': res.statusCode,
        'success': false,
        'result': 'Unauthorized'
      })
    }
  } else if (res.statusCode) {
    res.status(res.statusCode)
    res.json(res.body)
  } else {
    res.status(200)
    res.json(res.body)
  }
}
app.use(handleData)
app.use(function(err, req, res) {
  res.setHeader('Content-Type', 'application/json')

  if (err) {
    if (res.statusCode == 500) {
      res.status(250)
      res.json({
        'status': 250,
        'result': err
      })
    } else if (res.statusCode == 501) {
      res.status(250)
      res.json({
        'status': 250,
        'result': err
      })
    } else {
      res.status(500)
      res.json({
        'status': 500,
        'result': err.message
      })
    }
  } else {
    res.status(404)
    res.json({
      'status': 404,
      'result': 'Request not found'
    })
  }
})

https.globalAgent.maxSockets = 50
app.set('port', 8082)
var server = null
server = require('http').Server(app)
server.listen(app.get('port'), function () {
  console.log('explorer.api.zar.network',server.address().port)
  module.exports = server
})

Array.prototype.contains = function(obj) {
  var i = this.length
  while (i--) {
    if (this[i] === obj) {
      return true
    }
  }
  return false
}


try {
  sync.start()
} catch(ex) {
  console.log(ex)
  //TODO: start up recovery on exception
}
