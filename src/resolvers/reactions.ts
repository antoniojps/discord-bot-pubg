import { Client, MessageReaction, User, PartialUser } from 'discord.js'
import { EmbedPmRequest } from '../embeds/PmRequest'
import { EmbedPmNotice } from '../embeds/PmNotice'
import { parseAuthorIdFromLfsEmbed } from '../utils/embeds'

type Resolvers = {
  "✉️": (client: Client, reaction: MessageReaction, user: User | PartialUser) => Promise<void>,
  [key: string]: any,
}

export const resolvers: Resolvers = {
  "✉️": async (client, reaction, user) => {
    // todo: make sure its a LFS embed and not from the same person that created the embed
    const [embed] = reaction.message.embeds
    const authorEmbed: User | PartialUser | undefined = client.users.cache.find(user => user.id === parseAuthorIdFromLfsEmbed(embed))
    const authorReaction: User | PartialUser = user

    await authorReaction.send(EmbedPmNotice(authorReaction.id))
    if (authorEmbed) await authorEmbed.send(EmbedPmRequest(authorEmbed.id))
  }
}

export const REACTIONS = Object.keys(resolvers)

export const reactionsResolver = async (client: Client, reaction: MessageReaction, user: User | PartialUser) => {
  if (!REACTIONS.includes(reaction.emoji.name)) return null

  try {
    const emoji = reaction.emoji.name
    const resolver = resolvers[emoji]
    await resolver(client, reaction, user)
  } catch (err) {
    console.error(`Error running reaction resolver: "${reaction.emoji.name}"`, err.message)
  }
}