import { Constants, RichEmbed } from 'discord.js'
import { getDatabaseInfo, getBattleTagRank, updateRankInfo } from '../../web/dbFunctions'
import { getRoleEmoji } from '../util'

export function profile () {
  async function handler ({ message }) {
    var battleTag = 'N/A'
    var owRank = 'N/A'

    try {
      var dbInfo = await getDatabaseInfo(message.author.id)
      owRank = await getBattleTagRank(dbInfo.BattleTag)
      battleTag = dbInfo.BattleTag

      if (dbInfo.BattleRank !== owRank) {
        updateRankInfo(message.author.id, owRank)
      }
    } catch (e) {
    }

    const name = message.author.username
    const roleEmoji = getRoleEmoji(message.member)

    const embed = new RichEmbed()
    embed.setTitle(`${name}'s Profile`)
      .setColor(Constants.Colors.GREEN)

    embed.addField('BattleTag', `${battleTag}`, true)
    embed.addField('Rank', `${owRank}`, true)
    embed.addField('Roles', `${roleEmoji}`, true)

    return embed
  }

  return {
    handler,
    group: 'pugs',
    triggers: ['profile']
  }
}
