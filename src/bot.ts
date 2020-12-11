import { Client } from 'discord.js'
import dotenv from 'dotenv'
import { commandsResolver } from './resolvers/commands'
import { reactionsResolver } from './resolvers/reactions'

dotenv.config()
const client = new Client({ partials: ['GUILD_MEMBER', 'USER', 'REACTION'] });

client.login(process.env.DISCORDJS_BOT_TOKEN)

client.on('ready', () => {
  console.log(`${client?.user?.tag} has logged in.`)
  console.log(`connect to db`)
})

client.on("error", (error) => {
	console.error(error)
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  commandsResolver(client, message)
})

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  const messageIsEmbed = Boolean(reaction.message.embeds.length > 0)

  if (messageIsEmbed) {
    reactionsResolver(client, reaction, user)
  }
})