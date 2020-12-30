import { HelpMessageDefault, HelpMessageLfs, HelpMessageAdmin } from '../../embeds/Help';
import { CommandResolver, ALLOWED_ROLES } from '.';

const HelpResolver: CommandResolver = async (client, message) => {
  await message.delete();

  if (!process.env.LFS_CHANNEL_ID || !process.env.ROLES_CHANNEL_ID || !process.env.ADMIN_CHANNEL_ID) return;

  if (message.channel.id === process.env.ROLES_CHANNEL_ID) {
    const rolesChannel = await client.channels.fetch(process.env.ROLES_CHANNEL_ID);
    const lfsChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
    await message.channel.send(HelpMessageDefault(rolesChannel.toString(), lfsChannel.toString(), ALLOWED_ROLES));
  }

  if (message.channel.id === process.env.LFS_CHANNEL_ID) {
    const lfsChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
    await message.author.send(HelpMessageLfs(lfsChannel.toString()));
  }

  if (message.channel.id === process.env.ADMIN_CHANNEL_ID) {
    await message.channel.send(HelpMessageAdmin());
  }
};

export default HelpResolver;
