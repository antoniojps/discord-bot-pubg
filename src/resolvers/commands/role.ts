import { CommandResolver, ALLOWED_ROLES, QUOTE_REGEX } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { clearQuotes } from './../../utils/helpers';
import { logAdminMessage } from '../../services/logs';
import { EmbedErrorMessage } from '../../embeds/Error';

const RoleResolver: CommandResolver = async (client, message, argumentsParsed) => {
  if (message.channel.id !== process.env.ROLES_CHANNEL_ID || !process.env.DISCORD_SERVER_ID) return;

  const isRoleValid = QUOTE_REGEX.test(argumentsParsed._[1]);
  const roleName = isRoleValid ? clearQuotes(argumentsParsed._[1]).toLowerCase() : '';

  if (!isRoleValid) {
    await message.channel.send(
      EmbedErrorMessage(
        `<@${
          message.author.id
        }> role inválida, não te esqueças de escrever o nome da role entre aspas. Roles disponíveis: **${ALLOWED_ROLES.map(
          (r) => `\`"${r}"\``,
        ).join(',')}**.`,
      ),
    );
    return;
  }

  if (!ALLOWED_ROLES.includes(roleName)) {
    await message.channel.send(
      EmbedErrorMessage(
        `<@${message.author.id}> apenas podes adicionar/remover as seguintes roles: **${ALLOWED_ROLES.join(', ')}**.`,
      ),
    );
    return;
  }

  const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
  const role = roleName ? guild.roles.cache.find((r) => r.name.toLowerCase() === roleName, {}) : null;

  if (role) {
    // remove when already has role
    const memberRole = message.member?.roles.cache.find((r) => r.name.toLowerCase() === roleName);
    if (memberRole) {
      await message.member?.roles.remove(memberRole);
      await message.channel.send(EmbedSuccessMessage(`<@${message.author.id}> role **${role.name}** removida.`));
      if (roleName === 'streamer') {
        logAdminMessage(
          client,
          `Senhores administradores, removam o <@${message.author.id}> do [stream bot](https://mee6.xyz/dashboard/345984356340203520/twitch).`,
        );
      }

      return;
    }
    // add
    await message.member?.roles.add(role);
    await message.channel.send(
      EmbedSuccessMessage(
        `<@${message.author.id}> role **${role.name}** adicionada. ${
          roleName === 'streamer' ? 'Por favor escreve aqui o link para o teu perfil na twitch.' : ''
        }`,
      ),
    );
    if (roleName === 'streamer') {
      logAdminMessage(
        client,
        `Senhores administradores, adicionem o <@${message.author.id}> ao [stream bot](https://mee6.xyz/dashboard/345984356340203520/twitch)`,
      );
    }
    return;
  }

  await message.channel.send(
    EmbedErrorMessage(`<@${message.author.id}> role "${roleName}" não existe. Escreveste corretamente?`),
  );
};

export default RoleResolver;
