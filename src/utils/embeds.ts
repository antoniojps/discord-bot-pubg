import { MessageEmbed, Collection, Snowflake, Message } from 'discord.js';
import {
  parseUserIdFromMention,
  parseUserIdFromQueryString,
  parsePubgNickFromQueryString,
  parseAllMentionsIds,
  parseChannelFromLfsEmbed,
  parseDiscordAvatarIdFromUrl,
} from './helpers';
import { NOT_FOUND_MESSAGE, LfsEmbedProps } from './../embeds/LookingForSomeone';
import { StatsPartial, Tier } from './../services/pubg';

export const parseAuthorIdFromLfsEmbed = (embed: MessageEmbed) => {
  if (embed && embed.author && embed.author.iconURL) {
    const avatarUrl = new URL(embed.author.iconURL);
    const authorId = avatarUrl.pathname.split('/')[2];
    if (authorId) return authorId;
  }

  if (embed && embed.description) {
    // last mention will be the author
    const allMentions = parseAllMentionsIds(embed.description);
    return allMentions ? allMentions[allMentions.length - 1] : null;
  }

  return null;
};

export const isLfsTeamEmbed = (embed: MessageEmbed) => {
  return embed && embed.author && embed.author.iconURL;
};

type StatsKeys = keyof typeof statsKeysMap;

const STATS: StatsKeys[] = ['KD', 'ADR', 'WR'];
const statsKeysMap = {
  KD: 'kd',
  ADR: 'avgDamage',
  WR: 'winRatio',
};

export const parseUserStatsFromString = (line: string): StatsPartial | undefined => {
  const userInfo = line.split(',');
  if (userInfo.length > 0) {
    const firstSplit = userInfo[0].split(' ');
    const rank = firstSplit[firstSplit.length - 1];
    if (rank === NOT_FOUND_MESSAGE) return undefined;

    const statsRaw = userInfo.filter((info) => STATS.find((stat) => info.includes(stat)));
    const stats: StatsPartial = STATS.reduce((acc, current) => {
      const statRaw = statsRaw.find((raw) => raw.includes(current));
      const statWord = statRaw?.split(' ').find((n) => {
        const value = parseFloat(n);
        return value === 0 ? true : Boolean(value);
      });
      const statValue = statWord ? parseFloat(statWord) : NaN;
      const statKey = statsKeysMap[current];

      if (typeof statValue === 'number') {
        if (typeof acc === 'object')
          return {
            ...acc,
            [statKey]: statValue,
          };
        return {
          [statKey]: statValue,
        };
      }
      return acc;
    }, {});

    return {
      ...stats,
      winRatio: typeof stats?.winRatio === 'number' ? stats?.winRatio : NaN,
      bestRank: Object.values(Tier).includes(rank) ? rank : undefined,
    };
  }
};

export const parseUsersFromLfsEmbed = (embed: MessageEmbed) => {
  const lines = embed.description
    ?.split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, -1);
  const users = lines?.map((line) => {
    const pubgNickname = parsePubgNickFromQueryString(line);
    return {
      pubgNickname: pubgNickname ?? '',
      discordId: parseUserIdFromQueryString(line) || parseUserIdFromMention(line),
      stats: parseUserStatsFromString(line),
    };
  });

  return users;
};

export const parseUsersIdsFromLfsEmbed = (embed: MessageEmbed) => {
  const lines = embed.description
    ?.split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, -1);
  const users = lines?.map((line) => parseUserIdFromQueryString(line) || parseUserIdFromMention(line));

  return users;
};

export const parseLfsEmbed = (embed: MessageEmbed): LfsEmbedProps => {
  const channel = parseChannelFromLfsEmbed(embed);
  return {
    author: {
      id: parseAuthorIdFromLfsEmbed(embed) ?? '',
      avatar: embed.author?.iconURL ? parseDiscordAvatarIdFromUrl(embed.author.iconURL) : null,
    },
    channel,
    users: parseUsersFromLfsEmbed(embed),
  };
};

type MessageParsed = {
  message: Message;
  embed: MessageEmbed;
  embedParsed: LfsEmbedProps | null;
} | null;

export const parseMessagesRelatedToChannel = (
  messages: Message[] | undefined,
  voiceChannelId: string | undefined | null,
): MessageParsed => {
  if (!messages || !voiceChannelId) return null;

  const messagesUser = messages.filter((m) => {
    return m.embeds.find((e) => {
      const channel = parseChannelFromLfsEmbed(e);
      return channel?.id === voiceChannelId;
    });
  });

  const messageSortedByDate = messagesUser.slice().sort((a, b) => {
    const dateA = a.editedTimestamp ?? a.createdTimestamp;
    const dateB = b.editedTimestamp ?? b.createdTimestamp;
    return dateB - dateA;
  });

  const message = messageSortedByDate.length > 0 ? messageSortedByDate[0] : undefined;

  const embed = message?.embeds[0];
  if (!message || !embed || !isLfsTeamEmbed(embed)) return null;

  const embedParsed = embed ? parseLfsEmbed(embed) : null;
  return {
    message,
    embed,
    embedParsed,
  };
};

export const isValidEmbed = (parsed: MessageParsed) => {
  return Boolean(parsed && parsed.message && parsed.embedParsed && parsed.embedParsed.users);
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
