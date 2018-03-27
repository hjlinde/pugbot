import { commands } from './commands'
import { PugBot } from './bot/PugBot'
require('../web')

let pugBot = new PugBot()

pugBot.loadCommands(commands)
pugBot.loadServices()
pugBot.applyPugsMiddleware()
pugBot.start()
