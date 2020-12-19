import { VoiceState, Client, Message } from 'discord.js';
import { EmbedLookingForSomeone } from '../embeds/LookingForSomeone';
import { parseLfsEmbed, parseUsersIdsFromLfsEmbed } from './../utils/embeds';

export const voiceResolver = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  if (!process.env.LFS_CHANNEL_ID) return;

  const hasJoined = newState.channelID;
  const hasSwitched = hasJoined && oldState.channelID && newState.channelID !== oldState.channelID;
  const userId = newState.id;

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

  if (hasJoined) {
    if (hasSwitched) {
      // Remove ${userId} from embed related to ${oldState.channel} and add to ${newState.channel}
      // remove from old channel

      return;
    }
    // Add ${userId} to embed related to ${newState.channel}
    return;
  }

  // Remove ${userId} from embed related to ${oldState.channel}
  const message = lfsMessagesUserIsPresent[0];
  const embed = message.embeds[0];
  const embedParsed = parseLfsEmbed(embed);
  if (!(embed.footer?.text === 'lfs') || !embedParsed || !embedParsed.users) return;

  // delete embed if only person on embed left and user has left
  if (embedParsed.users.length === 1) {
    await message.delete();
  }

  // remove from embed if not the author
  if (
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
