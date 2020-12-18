import qs from 'query-string';
import { MessageEmbed, Collection, Snowflake, Message } from 'discord.js';
import { parseUserIdFromMention, parseUserIdFromQueryString } from './helpers';

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

export const parseChannelIdFromLfsEmbed = (embed: MessageEmbed) => {
  if (embed && embed.author && embed.author.iconURL) {
    const authorUrl = new URL(embed.author.iconURL);
    const query = qs.parse(authorUrl.search);
    if (typeof query?.channelId === 'string') return query?.channelId;
  }

  return null;
};

export const parseUsersFromLfsEmbed = (embed: MessageEmbed) => {
  const lines = embed.description
    ?.split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, -1);
  const users = lines?.map((line) => {
    return parseUserIdFromQueryString(line) || parseUserIdFromMention(line);
  });

  return users;
};

export type LfsEmbedObject = {
  author: string | null;
  channelId: string | null;
  users: (string | null)[] | undefined;
};

export const parseLfsEmbed = (embed: MessageEmbed): LfsEmbedObject => {
  const channelId = parseChannelIdFromLfsEmbed(embed);
  return { author: parseAuthorIdFromLfsEmbed(embed), channelId, users: parseUsersFromLfsEmbed(embed) };
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
