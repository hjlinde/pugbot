var azure = require('azure-storage')
const request = require('request-promise-native')

export function updateDatabaseInfo (userInfo, battlenetInfo, token, rank) {
  return new Promise(function (resolve, reject) {
    console.log('Updating Azure table storage record')
    var tableService = azure.createTableService()
    tableService.createTableIfNotExists('discord', function (error, result, response) {
      if (!error) {
        var entGen = azure.TableUtilities.entityGenerator
        var record = {
          PartitionKey: entGen.String('discord'),
          RowKey: entGen.String(userInfo.id),
          DiscordAccessToken: entGen.String(token),
          DiscordUsername: entGen.String(userInfo.username),
          DiscordDiscriminator: entGen.String(userInfo.discriminator),
          BattleTag: entGen.String(battlenetInfo.name),
          BattleID: entGen.String(battlenetInfo.id),
          BattleRank: entGen.Int32(rank || '0')
        }
        tableService.insertOrReplaceEntity('discord', record, function (error, result, response) {
          if (error) {
            reject(new Error('Azure insert/replace failed.'))
          }
          console.log('Azure record updated')
          resolve()
        })
      }
    })
  })
}

export function updateRankInfo (discordUserID, battlenetRank) {
  return new Promise(function (resolve, reject) {
    console.log('Updating Azure table storage record')
    var tableService = azure.createTableService()
    tableService.createTableIfNotExists('discord', function (error, result, response) {
      if (!error) {
        console.log("Storing battlenetRank: "+(parseInt(battlenetRank)||'0'))
        var entGen = azure.TableUtilities.entityGenerator
        var record = {
          PartitionKey: entGen.String('discord'),
          RowKey: entGen.String(discordUserID),
          BattleRank: entGen.Int32(parseInt(battlenetRank) || '0')
        }
        tableService.mergeEntity('discord', record, function (error, result, response) {
          if (error) {
            console.log(error)
            reject(new Error('Azure merge failed.'))
          }
          console.log('Azure record updated')
          resolve()
        })
      }
    })
  })
}

export function getDatabaseInfo (discordUserID) {
  return new Promise(function (resolve, reject) {
    var tableService = azure.createTableService()
    tableService.retrieveEntity('discord', 'discord', discordUserID, function (error, result, response) {
      if (error) {
        reject(error)
      }
      resolve(response.body)
    })
  })
}

export function getBattleTagRank (battleTagRaw) {
  return new Promise(function (resolve, reject) {
    const battleTag = battleTagRaw.replace('#', '-')
    const url = `https://ow-api.com/v1/stats/pc/eu/${battleTag}/profile`
    request(url).then(function (body) {
      let profile = JSON.parse(body)
      resolve(profile.rating)
    })
  })
}
