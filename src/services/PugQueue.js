import { getFullName } from '../util'
import { getRoles } from '../util'
import { pug_map } from '../util'

export class PugQueue {
  constructor () {
    this.gameCounter = 0
    this.queue = []
    this.idleTimers = new Map()
  }

  getQueueState () {
    return `${this.queue.length}/${process.env.TEAM_SIZE * 2}`
  }

  add (member) {
    const name = getFullName(member)
    const pug_roles = getRoles(member)

    if (this.queue.includes(member)) {
      return `${name} is already queued.`
    }

    if (this.queue.length >= 12) {
      return `Queue is full.`
    }

    this.queue.push(member)
    member.addRole(process.env.PUGS_ROLE)

    return `${String.fromCodePoint(0x2705)} ${name} ${pug_roles} added to queue. ${this.getQueueState()}`
  }

  attemptGameStart (guild) {
    if (this.queue.length < process.env.TEAM_SIZE * 1) {
      return
    }

    let mentions = ``
    this.queue.forEach(member => {
      const name = getFullName(member)
      const pug_roles = getRoles(member)
      mentions += `${member} ${pug_roles}\n`
    })

    // Announce game start and alert players
    const announce_channel = guild.client.channels.get(process.env.PUGS_ANNOUNCEMENTCHANNEL)
    const map = pug_map()
    announce_channel.send(`❮❮❮\t\t **Match Starting!**\t\t ❯❯❯\n
*Following players head over to Match Draft:*\n
${mentions}\n

${map}

❯❯❯\t\t*end of match announcement*\t\t❮❮❮\n
	`)
    
    // Notification for queue full
    const pugs_channel = guild.client.channels.get(process.env.PUGS_CHANNEL)
    pugs_channel.send(`We have our 12 players, lets go!`)
    
    // Empty queue
    this.queue.length = 0
  }

  startIdleTimer (member) {
    this.idleTimers.set(member.id, setTimeout(() => {
      if (this.removeHelper(member)) {
        const channel = member.guild.channels.get(process.env.PUGS_CHANNEL)
        channel.send(`${String.fromCodePoint(0x274C)} ${getFullName(member)} removed from queue due to idling. ${this.getQueueState()}`)
      }
    }, process.env.IDLE_TIME))
  }

  stopIdleTimer (member) {
    const timeout = this.idleTimers.get(member.id)
    if (timeout !== undefined) {
      clearTimeout(timeout)
    }
  }

  removeHelper (member) {
    member.removeRole(process.env.PUGS_ROLE)

    const memberPos = this.queue.indexOf(member)
    if (memberPos >= 0) {
      this.queue.splice(memberPos, 1)
      return true
    }
    return false
  }

  remove (member) {
    if (this.removeHelper(member)) {
      return `${String.fromCodePoint(0x274C)} ${getFullName(member)} removed from queue. ${this.getQueueState()}`
    }
  }

  removeOffline (member) {
    if (this.removeHelper(member)) {
      const channel = member.guild.channels.get(process.env.PUGS_CHANNEL)
      channel.send(`${String.fromCodePoint(0x274C)} ${getFullName(member)} removed from queue due to going offline. ${this.getQueueState()}`)
    }
  }
}
