import User from './../../models/user';
import { CommandResolver } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { addStatsRoles } from '../../services/roles';

const UpdateResolver: CommandResolver = async (client, message) => {
  if (message.channel.id !== process.env.ROLES_CHANNEL_ID) return;

  const feedbackMessage = await message.channel.send('A atualizar...');

  const updatedUser = await User.updatePubgStats({
    discordId: message.author.id,
  });

  await feedbackMessage.edit(
    EmbedSuccessMessage(
      `Conta atualizada [${updatedUser.pubgNickname}](https://pubg.op.gg/user/${updatedUser.pubgNickname}).`,
    ),
  );

  if (
    typeof updatedUser?.stats?.bestRank === 'string' &&
    typeof updatedUser?.stats?.avgDamage === 'number' &&
    typeof updatedUser?.stats?.kd === 'number' &&
    typeof updatedUser?.stats?.winRatio === 'number' &&
    message?.member
  ) {
    await addStatsRoles(message.member, updatedUser.stats);
    await feedbackMessage.edit(
      `<@${message.author.id}>, **Modo**: Squad-FPP, **Rank** (maior): ${updatedUser.stats.bestRank}, **ADR**: ${updatedUser.stats.avgDamage}, **K/D**: ${updatedUser.stats.kd}, **WR**: ${updatedUser.stats.winRatio}%`,
    );
  }
};

export default UpdateResolver;
