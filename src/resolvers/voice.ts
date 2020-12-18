import { VoiceState, Client, Message } from 'discord.js';
import { parseLfsEmbed } from './../utils/embeds';

export const voiceResolver = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  if (!process.env.LFS_CHANNEL_ID) return;

  const hasJoined = newState.channelID;
  const hasSwitched = hasJoined && oldState.channelID && newState.channelID !== oldState.channelID;
  const userId = newState.id;

  // find embeds where user is present
  const textChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
  if (textChannel.isText()) {
    const messages = await textChannel.messages.fetch();
    const lfsMessagesUserIsPresent: Message[] = [];
    messages.forEach((m) => {
      if (m.author.bot && m.embeds.length > 0) {
        const embedsWithUser = m.embeds.filter(
          (embed) => embed.footer?.text === 'lfs' && parseLfsEmbed(embed).users?.find((u) => u === userId),
        );
        if (embedsWithUser.length > 0) {
          lfsMessagesUserIsPresent.push(m);
        }
      }
    });
    console.log({ lfsMessagesUserIsPresent });
  }

  if (hasJoined) {
    if (hasSwitched) {
      // Remove ${userId} from embed related to ${newState.channel} and add to ${oldState.channel}
      return;
    }
    // Add ${userId} to embed related to ${newState.channel}
    return;
  }

  // Remove ${userId} from embed related to ${oldState.channel}
};
