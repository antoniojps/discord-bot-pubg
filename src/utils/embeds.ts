import { MessageEmbed, Collection, Snowflake, Message } from 'discord.js';
import { parseUserIdFromMention } from './helpers';

export const parseAuthorIdFromLfsEmbed = (embed: MessageEmbed) => {
  if (embed && embed.author && embed.author.iconURL) {
    const avatarUrl = new URL(embed.author.iconURL);
    const authorId = avatarUrl.pathname.split('/')[2];
    return authorId;
  }

  if (embed && embed.description) {
    return parseUserIdFromMention(embed.description);
  }

  return null;
};

export const deleteAllLfsAuthorEmbeds = async (authorId: string, messages: Collection<Snowflake, Message>) => {
  const deleteMessagesPromises: Promise<Message>[] = [];
  messages.forEach((m) => {
    if (m.author.bot && m.embeds.length > 0) {
      const embedsGeneratedByAuthor = m.embeds.filter((embed) => parseAuthorIdFromLfsEmbed(embed) === authorId);
      if (embedsGeneratedByAuthor.length > 0) {
        deleteMessagesPromises.push(m.delete());
      }
    }
  });

  if (deleteMessagesPromises.length > 0) {
    await Promise.all(deleteMessagesPromises);
  }
};
