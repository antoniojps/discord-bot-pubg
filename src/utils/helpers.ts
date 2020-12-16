import { UserDocument } from './../models/user';
import { Collection, Snowflake, GuildMember } from 'discord.js';

export const findClosestNumber = (available: number[], goal: number): number =>
  available.reduce(function (prev, curr) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });

export const parseUserIdFromMention = (message: string): string | null => {
  const match = message.match('<@(.*)>');
  return match && match[1] ? match[1] : null;
};

export const computeUserPartialFromDocument = (discordId: string, document?: UserDocument | null) => ({
  discordId,
  pubgNickname: document?.pubgNickname || '',
  stats: document?.stats,
});

export const computeChannelUsers = (
  members: Collection<Snowflake, GuildMember>,
  users: UserDocument[],
  authorDiscordId: string,
) => {
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
