import { MessageEmbed } from 'discord.js'

export const parseAuthorIdFromLfsEmbed = (embed: MessageEmbed) => {
  if (embed && embed.author && embed.author.iconURL) {
    const avatarUrl = new URL(embed.author.iconURL)
    const authorId = avatarUrl.pathname.split('/')[2]
    return authorId
  }
  return null
}