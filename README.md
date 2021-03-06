# pugbot

A Discord bot for organising pickup games.

## Getting Started

These instructions will get you a copy of the bot up and running on your local machine for development and testing purposes. Although these steps make use of yarn, npm can be used too.

### Prerequisites

* [Node.js](https://nodejs.org)
* [yarn](https://yarnpkg.com) (_Optional_)
* A Discord app token - go [here](https://discordapp.com/developers/applications/me) and create a new app, you can then reveal the token on the app's page

### Installing

Clone this repo
```
git clone https://github.com/joshramsbottom/pugbot.git
```

Inside the directory, install required packages
```
yarn install
```

Lastly, create a file named `.env`, see [Setting up .env file](#setting-up-env-file) for what to put in it

## Usage

To run the bot in development mode with live reloading
```
yarn run develop
```

To compile the source and run manually
```
yarn run build
yarn start
```

## Setting up .env file

Pugbot uses environment variables for configuration, these are read from a file named `.env` in the root project directory when running the bot. This file should not be checked into version control and should be environment specific.

The contents of the file should be a series of lines containing `VAR_NAME=VALUE` where the following variables can be used:

Variable name | Value
------------ | -------------
TOKEN | Token generated by Discord for your app
PUGS_CHANNEL | Discord channel ID
PUGS_ROLE | Discord role ID
TEMP_CHANNEL_LIFETIME | Time to keep temporary pickup game channels (milliseconds)
TEAM_SIZE | Number of players that make up a team in your chosen game
IDLE_TIME | Time after user goes AFK in Discord before they are removed from the queue (milliseconds) 
TANK_ROLE | Discord role ID
FLEX_ROLE | Discord role ID
DPS_ROLE | Discord role ID
SUPPORT_ROLE | Discord role ID

An example `.env` file might look something like:
```
TOKEN=<insert token here>
PUGS_CHANNEL=183878860331286530
PUGS_ROLE=393869466452099072
TEMP_CHANNEL_LIFETIME=3600000
TEAM_SIZE=6
IDLE_TIME=1200000
TANK_ROLE=402067038278909952
FLEX_ROLE=402067197180248074
DPS_ROLE=402067250523275266
SUPPORT_ROLE=402067294173396992
```

### How to get a role ID from Discord

While getting the ID of most things in Discord (channels, users) normally involves right click > "Copy ID", this does not currently work for roles on a Discord server.

In order to get a role's ID make sure the role is mentionable in server settings, then type this in a channel (note that this will actually also mention users with the role):
```
\@<insert role name here>
```
Your message should turn into something that looks like this after sending:
```
<@&402067038278909952>
```

The numeric part is the ID of the role you mentioned.

## Built with

* [Ghastly](https://ghastly.js.org) - Modular command library for Discord.js bots
* [dotenv](https://github.com/motdotla/dotenv) - Load environment variables from .env file

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details