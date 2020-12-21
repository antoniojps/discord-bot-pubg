import { UserDocument } from './../models/user';
import { Collection, Snowflake, GuildMember } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { LfsUsers } from './../embeds/LookingForSomeone';
import qs from 'query-string';

export const findClosestNumber = (available: number[], goal: number): number =>
  available.reduce(function (prev, curr) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });

export const parseAllMentionsIds = (message: string): string[] | null => {
  const mentionMatches = message.match(/<@(.*?)>/g);
  const matches = mentionMatches?.map((mention) => mention.match('<@(.*?)>'));
  if (matches) {
    const mentions = matches.map((m) => (m && m.length > 0 ? m[1] : null));
    return mentions.filter((m) => typeof m === 'string') as string[];
  }
  return null;
};

export const parseUserIdFromMention = (message: string): string | null => {
  const match = message.match('<@(.*?)>');
  return match && match[1] ? match[1] : null;
};

export const parseUserIdFromQueryString = (message: string): string | null => {
  const match = message.match(/\?discordId=(.*)\&/);
  return match && match[1] ? match[1] : null;
};

export const parsePubgNickFromQueryString = (message: string): string | null => {
  const match = message.match(/\&nick=(.*)\)/);
  return match && match[1] ? match[1] : null;
};

export const computeUserPartialFromDocument = (discordId: string, document?: UserDocument | null) => ({
  discordId,
  pubgNickname: document?.pubgNickname || '',
  stats: document?.stats,
});

export const parseChannelFromLfsEmbed = (embed: MessageEmbed) => {
  if (embed && embed.author && embed.author.iconURL) {
    const authorUrl = new URL(embed.author.iconURL);
    const query = qs.parse(authorUrl.search);
    return {
      id: typeof query?.channelId === 'string' ? query.channelId : null,
      name: typeof query?.channelName === 'string' ? query.channelName : null,
    };
  }

  return null;
};

export const parseDiscordAvatarIdFromUrl = (url: string): string | null => {
  const parsedUrl = new URL(url);
  if (parsedUrl.host !== 'cdn.discordapp.com') return null;

  const paths = parsedUrl.pathname.split('/');
  const [discordId] = paths[paths.length - 1].split('.');

  return discordId ?? null;
};

export const computeChannelUsers = (
  members: Collection<Snowflake, GuildMember>,
  users: UserDocument[],
  authorDiscordId: string,
): LfsUsers => {
  const userWithData = members.map((member) => {
    const document = users.find((user) => user.discordId === member.id);
    return computeUserPartialFromDocument(member.id, document);
  });
  const authorFirst = [
    ...userWithData.filter(({ discordId }) => discordId === authorDiscordId),
    ...userWithData.filter(({ discordId }) => discordId !== authorDiscordId),
  ];
  return authorFirst;
};

export const millisToMinutes = (millis: number) => Math.floor(millis / 60000);
export const clearQuotes = (str: string) => str?.replace(/^["'](.+(?=["']$))["']$/, '$1');
