import { Client, Message, } from 'discord.js'
import { EmbedLookingForSomeone } from '../embeds/LookingForSomeone'
import { parseAuthorIdFromLfsEmbed } from '../utils/embeds'

type CommandResolver = (client: Client, message: Message) => Promise<void>

type Resolvers = {
  lfs: CommandResolver,
  "-": CommandResolver,
  [key: string]: any,
}

export const resolvers: Resolvers = {
  lfs: async (client, message) => {
    await message.delete()

    const embed = await message.channel.send(EmbedLookingForSomeone(message));
    await embed.react('✉️')
  },
  "-": async (client, message) => {
    if (!process.env.LFS_CHANNEL_ID) return;

    await message.delete()
    const channel = await client.channels.fetch(process.env.LFS_CHANNEL_ID)
    if (channel.isText()) {
      const messages = await channel.messages.fetch()
      // find all embeds initiated by the author of this command
      const authorEmbedsMessages = messages.filter(m => m.author.bot && m.embeds.length > 0 && parseAuthorIdFromLfsEmbed(m.embeds[0]) === message.author.id)
      const deleteAllAuthorEmbedsPromise = authorEmbedsMessages.map(m => m.delete())
      await Promise.all(deleteAllAuthorEmbedsPromise)
    }
  }
}

export const COMMANDS = Object.keys(resolvers)

export const commandsResolver = async (client: Client, message: Message) => {
  const command = message.content.toLowerCase().trim()
  if (
    !COMMANDS.includes(command) ||
    message.channel.id !== process.env.LFS_CHANNEL_ID
  ) return null;

  try {
    const resolver = resolvers[command]
    await resolver(client, message)
  } catch (err) {
    console.error(`Error running command resolver: "${command}"`, err.message)
  }
}