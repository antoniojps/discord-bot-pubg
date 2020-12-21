import { Client } from 'discord.js';
import { EmbedErrorMessage } from './../embeds/Error';

export const logError = async (client: Client, channelId: string, err: Error) => {
  const isAdminChannel = channelId === process.env.ADMIN_CHANNEL_ID;

  // always show error on admin channel
  if (!isAdminChannel) {
    const adminChannel = process.env.ADMIN_CHANNEL_ID
      ? await client.channels.fetch(process.env.ADMIN_CHANNEL_ID)
      : null;

    if (adminChannel?.isText()) {
      adminChannel.send(EmbedErrorMessage(err.message));
    }
  }
};
