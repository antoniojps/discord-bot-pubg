import User from './../../models/user';
import { removeRoles } from '../../services/roles';
import { EmbedError } from '../../embeds/Error';
import { CommandResolver } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';

const UnlinkResolver: CommandResolver = async (client, message, argumentsParsed) => {
  const isAdminChannel = message.channel.id === process.env.ADMIN_CHANNEL_ID;
  if (!isAdminChannel) return;

  const pubgNickname = argumentsParsed._[1] || '';
  const command = `\`/unlink PUBG_NICKNAME\``;

  if (pubgNickname === '') {
    throw new EmbedError(
      `<@${message.author.id}> para desassociar a conta é necessário dizer o nome no pubg, exemplo:  ${command}`,
    );
  }

  const feedbackMessage = await message.channel.send('A desassociar conta...');
  const { discordId } = await User.deleteByPubgAccount(pubgNickname);

  const member = await message.guild?.members.fetch(discordId);
  if (member) {
    await removeRoles(member);
    await message.channel.send(`Roles de <@${discordId}> removidas.`);
  }

  await feedbackMessage.edit(
    EmbedSuccessMessage(
      `Desassociaste a conta [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) à conta de Discord <@${discordId}>`,
    ),
  );
};

export default UnlinkResolver;
