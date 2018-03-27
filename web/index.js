require('dotenv').config()
const express = require('express')
const app = express()
const request = require('request-promise-native')
var azure = require('azure-storage')

const port = process.env.PORT || 8080

function getDiscordUserInfo (token) {
  return new Promise(function (resolve, reject) {
    request({url: 'https://discordapp.com/api/users/@me',
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token}
    }).then(function (result) {
      var json = JSON.parse(result)
      resolve(json)
    })
  })
}

function getBattlenetConnection (connectionInfo) {
  return connectionInfo.find(function (itm) {
    return itm['type'] === 'battlenet'
  })
}

function updateAzureTableInfo (userInfo, battleConnectionInfo, token) {
  return new Promise(function (resolve, reject) {
    var tableSvc = azure.createTableService()
    tableSvc.createTableIfNotExists('discord', function (error, result, response) {
      if (!error) {
        var entGen = azure.TableUtilities.entityGenerator
        var record = {
          PartitionKey: entGen.String('discord'),
          RowKey: entGen.String(userInfo.id),
          DiscordAccessToken: entGen.String(token),
          DiscordUsername: entGen.String(userInfo.username),
          DiscordDiscriminator: entGen.String(userInfo.discriminator),
          BattleTag: entGen.String(battleConnectionInfo.name),
          BattleID: entGen.String(battleConnectionInfo.id),
          BattleRank: entGen.Int32(0)
        }
        tableSvc.insertOrReplaceEntity('discord', record, function (error, result, response) {
          resolve()
        })
      }
    })
  })
}

function getDiscordUserConnections (token) {
  return new Promise(function (resolve, reject) {
    request({url: 'https://discordapp.com/api/users/@me/connections',
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token}
    }).then(function (result) {
      var json = JSON.parse(result)
      resolve(json)
    })
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
    console.log(result)
    var json = JSON.parse(result)
    var accessToken = json['accessToken']
    console.log(accessToken)

    var userinfo = ''
    var userinfoJson = ''
    var connectioninfo = ''

    getDiscordUserInfo(accessToken).then(function (info) {
      userinfo = JSON.stringify(info)
      userinfoJson = info
      getDiscordUserConnections(accessToken).then(function (info) {
        connectioninfo = JSON.stringify(info)
        console.log(info[0].type)
        var battlenet = getBattlenetConnection(info)

        if (battlenet === undefined) {
          res.setHeader('Content-Type', 'text/html')
          res.writeHead(res.statusCode)
          res.write('No battle.net connection found')
          res.end()
        } else {
          updateAzureTableInfo(userinfoJson, battlenet, accessToken).then(function () {
            res.setHeader('Content-Type', 'text/html')
            res.writeHead(res.statusCode)
            res.write('OAuth2 Access Token: ' + accessToken)
            res.write('<br/><br/>\r\n')
            res.write('Discord User Info: ' + userinfo)
            res.write('<br/><br/>\r\n')
            res.write('Connection Info: ' + JSON.stringify(battlenet))
            res.end()
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

  console.log(`server is listening on ${port}`)
})

