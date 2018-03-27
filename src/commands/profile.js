import { Constants, RichEmbed } from 'discord.js'
import { getDatabaseInfo } from '../../web/dbFunctions'
import { getFullName, getRoleEmoji} from '../util'

export function profile () {
  async function handler ({ message }) {
    var dbInfo = await getDatabaseInfo(message.author.id)
    const name = getFullName(message.member)
    const roleEmoji = getRoleEmoji(message.member)
    const owRank = '3148'
    
    const embed = new RichEmbed()
    embed.setTitle(`${name}'s PUGS Profile`)
      .setColor(Constants.Colors.GREEN)

    embed.addField('BattleTag', `${dbInfo.BattleTag}`, true)
    embed.addField('Rank', `${owRank}`, true)
    embed.addField('Roles', `${roleEmoji}`, true)

    return embed
  }

  return {
    handler,
    triggers: ['profile']
  }
}
