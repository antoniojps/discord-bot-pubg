import { Client, Message } from 'discord.js'
import { EmbedLookingForSomeone } from '../embeds/LookingForSomeone'

type Resolvers = {
  lfs: (client: Client, message: Message) => Promise<void>,
  [key: string]: any,
}

export const resolvers: Resolvers = {
  lfs: async (client, message) => {
    const embed = await message.channel.send(EmbedLookingForSomeone(message));
    await embed.react('✉️')
    await message.delete()
  }
}

export const COMMANDS = Object.keys(resolvers)

export const commandsResolver = async (client: Client, message: Message) => {
  const command = message.content.toLowerCase().trim()
  if (!COMMANDS.includes(command)) return null;

  try {
    const resolver = resolvers[command]
    await resolver(client, message)
  } catch (err) {
    console.error(`Error running command resolver: "${command}"`, err.message)
  }
}