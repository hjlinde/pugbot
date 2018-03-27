var azure = require('azure-storage')

export function updateDatabaseInfo (userInfo, battleConnectionInfo, token) {
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
            BattleTag: entGen.String(battleConnectionInfo.name),
            BattleID: entGen.String(battleConnectionInfo.id),
            BattleRank: entGen.Int32(0)
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

  export function getDatabaseInfo (discordUserID) {
    return new Promise(function(resolve, reject) {
      var tableService = azure.createTableService();
      tableService.retrieveEntity('discord', 'discord', discordUserID, function(error, result, response) {
        if (error) {
          reject(error)
        }
        resolve(response.body);
      });
  })
}