import { Constants, RichEmbed } from 'discord.js'
import { getFullName } from '../util'
import { getRoles } from '../util'

export function myroles (member) {
  async function handler ({ message }) {
    const roles = getRoles(member)
    const embed = new RichEmbed()

    embed.setTitle(`Your current roles`).setColor(Constants.Colors.GREEN)

    let text = roles

    embed.setDescription(text)

    return embed
  }

  return {
    handler,
    triggers: ['roles'],
    group: 'pugs',
    description: 'See which pug roles you have.'
  }
}