export function ping () {
  async function handler ({message, client}) {
    const m = await message.channel.send("Ping?");
    return `Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`
  }

  return {
    handler,
    triggers: ['ping']
  }
}
