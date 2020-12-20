import { VoiceState, Client, Message } from 'discord.js';
import { EmbedLookingForSomeone, Author } from '../embeds/LookingForSomeone';
import User from '../models/user';
import { parseMessagesRelatedToChannel, parseUsersIdsFromLfsEmbed } from './../utils/embeds';

export const voiceResolver = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  if (!process.env.LFS_CHANNEL_ID) return;

  const hasJoined = newState.channelID;
  const hasSwitched = hasJoined && oldState.channelID && newState.channelID !== oldState.channelID;
  const userId = newState.id;
  const prevVoiceChannel = oldState.channelID;
  const newVoiceChannel = newState.channelID;

  // find embeds where user is present
  const textChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
  if (!textChannel.isText()) return;

  const messages = await textChannel.messages.fetch();
  const lfsMessagesUserIsPresent: Message[] = [];
  messages.forEach((m) => {
    if (m.author.bot && m.embeds.length > 0) {
      const embedsWithUser = m.embeds.filter(
        (embed) => embed.footer?.text === 'lfs' && parseUsersIdsFromLfsEmbed(embed)?.find((u) => u === userId),
      );
      if (embedsWithUser.length > 0) {
        lfsMessagesUserIsPresent.push(m);
      }
    }
  });

  if (lfsMessagesUserIsPresent.length === 0) return;

  const prevMessageParsed = parseMessagesRelatedToChannel(lfsMessagesUserIsPresent, prevVoiceChannel);
  const newMessageParsed = parseMessagesRelatedToChannel(lfsMessagesUserIsPresent, newVoiceChannel);

  if (hasJoined) {
    if (hasSwitched) {
      // delete user from previous embed
      if (prevMessageParsed?.message && prevMessageParsed?.embedParsed && prevMessageParsed?.embedParsed.users) {
        const { message } = prevMessageParsed;
        // last user left, delete embed
        if (prevMessageParsed.embedParsed.users.length === 1) {
          await message.delete();
        } else {
          const usersRemaining = prevMessageParsed.embedParsed.users.filter((u) => u.discordId !== userId);
          // update author if author left (person to send pm)
          const hasAuthor = usersRemaining.find((u) => u.discordId === prevMessageParsed.embedParsed?.author.id);
          const author: Author = hasAuthor
            ? prevMessageParsed.embedParsed?.author
            : { id: usersRemaining[0].discordId || '', avatar: null };

          await message.edit(
            '',
            EmbedLookingForSomeone({
              ...prevMessageParsed.embedParsed,
              users: usersRemaining,
              author,
            }),
          );
        }
      }
    }

    // Add user to embed related to channel
    // todo fix why user is not being added
    console.log({ newMessageParsed });
    if (newMessageParsed?.message && newMessageParsed?.embedParsed?.users) {
      const { message } = newMessageParsed;
      const userDb = await User.findOne({ discordId: userId });
      const userNew = {
        pubgNickname: userDb?.pubgNickname ?? '',
        discordId: userDb?.discordId ?? userId,
        stats: {
          kd: userDb?.stats?.kd ?? undefined,
          avgDamage: userDb?.stats?.avgDamage ?? undefined,
          bestRank: userDb?.stats?.bestRank ?? undefined,
          winRatio: userDb?.stats?.winRatio ?? undefined,
        },
      };
      const isValidNewUser = Boolean(
        userNew?.pubgNickname &&
          userNew?.discordId &&
          userNew?.stats.kd &&
          userNew?.stats.avgDamage &&
          userNew?.stats.bestRank &&
          userNew?.stats.winRatio,
      );
      const usersNew = isValidNewUser
        ? [...newMessageParsed.embedParsed.users, userNew]
        : newMessageParsed.embedParsed.users;

      await message.edit('', EmbedLookingForSomeone({ ...newMessageParsed.embedParsed, users: usersNew }));
    }

    return;
  }

  // Remove user from channel embed
  if (!prevMessageParsed?.message || !prevMessageParsed?.embedParsed || !prevMessageParsed?.embedParsed.users) return;
  const { message, embedParsed } = prevMessageParsed;

  // delete embed if only person on embed left and user has left
  if (prevMessageParsed.embedParsed.users.length === 1) {
    await message.delete();
  }

  // remove from embed if not the author
  if (
    embedParsed.users &&
    embedParsed.users.length > 1 &&
    embedParsed.author &&
    embedParsed.author.id !== null &&
    embedParsed.author.id !== userId
  ) {
    const newUsers = embedParsed.users.filter((u) => u.discordId !== userId);
    await message.edit(
      '',
      EmbedLookingForSomeone({
        ...embedParsed,
        users: newUsers,
      }),
    );
  }
};
