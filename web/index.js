import { updateDatabaseInfo, getBattleTagRank } from './dbFunctions'

require('dotenv').config()
const express = require('express')
const app = express()
const request = require('request-promise-native')
const port = process.env.PORT || 8080

function getDiscordUserInfo (token) {
  return new Promise(function (resolve, reject) {
    console.log('Requesting discord user info with token: ' + token)
    request({url: 'https://discordapp.com/api/users/@me',
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token}
    }).then(function (result) {
      console.log('Received user info:' + result + '\r\n\r\n')
      var json = JSON.parse(result)
      resolve(json)
    })
  })
}

function getDiscordUserConnections (token) {
  return new Promise(function (resolve, reject) {
    console.log('Requesting discord connection info with token: ' + token)
    request({url: 'https://discordapp.com/api/users/@me/connections',
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token}
    }).then(function (result) {
      console.log('Received connection info:' + result + '\r\n\r\n')
      var json = JSON.parse(result)
      resolve(json)
    })
  })
}

function getBattleTag (connectionInfo) {
  return connectionInfo.find(function (itm) {
    return itm['type'] === 'battlenet'
  })
}

app.get('/callback', (req, res) => {
  var authCode = req.query.code

  request({url: 'https://discordapp.com/api/oauth2/token',
    method: 'POST',
    form: {
      client_id: process.env.APP_CLIENT_ID,
      client_secret: process.env.APP_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: process.env.REDIRECT_URI || 'http://localhost:8080/callback'
    }
  }).then(function (result) {
    // console.log(result);
    var json = JSON.parse(result)
    var accessToken = json['access_token']
    console.log('\r\nCode swapped for access token. access_token = ' + accessToken + '\r\n')

    var userinfo = ''
    var userinfoJson = ''
    var connectioninfo = ''

    getDiscordUserInfo(accessToken).then(function (info) {
      userinfo = JSON.stringify(info)
      userinfoJson = info
      getDiscordUserConnections(accessToken).then(function (info) {
        connectioninfo = JSON.stringify(info)
        var battlenet = getBattleTag(info)

        if (battlenet === undefined) {
          console.log("No connection found with type 'battlenet'")
          res.setHeader('Content-Type', 'text/html')
          res.writeHead(res.statusCode)
          res.write('No battle.net connection found')
          res.end()
        } else {
          getBattleTagRank(battlenet.id).then(function (rank) {
            console.log('Battlenet connection found')
            updateDatabaseInfo(userinfoJson, battlenet, accessToken, rank).then(function () {
              res.setHeader('Content-Type', 'text/html')
              res.writeHead(res.statusCode)
              res.write('OAuth2 Access Token: ' + accessToken)
              res.write('<br/><br/>\r\n')
              res.write('Discord User Info: ' + userinfo)
              res.write('<br/><br/>\r\n')
              res.write('Connection Info: ' + JSON.stringify(battlenet))
              res.end()
            })
          })
        }
      })
    })
  })

  console.log('Received authorization code [' + req.query.code + ']')
})

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`Express running on port ${port}...`)
})
