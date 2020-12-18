import argv from 'yargs-parser';
import { Client, GuildMember, Message } from 'discord.js';
import { EmbedHelp } from '../embeds/Help';
import { EmbedLookingForSomeone } from '../embeds/LookingForSomeone';
import { EmbedErrorMessage, EmbedError } from '../embeds/Error';
import { EmbedSuccessMessage } from '../embeds/Success';
import { parseAuthorIdFromLfsEmbed, deleteAllLfsAuthorEmbeds } from '../utils/embeds';
import { addStatsRoles, removeRoles } from '../services/roles';
import { computeChannelUsers, computeUserPartialFromDocument } from './../utils/helpers';
import User from './../models/user';
import AntiSpam from './../services/spam';

type CommandResolver = (client: Client, message: Message, argumentsParsed: argv.Arguments) => Promise<void>;

type Resolvers = {
  [key: string]: CommandResolver;
};

export const resolvers: Resolvers = {
  lfs: async (client, message) => {
    if (message.channel.id !== process.env.LFS_CHANNEL_ID) return;

    await message.delete();
    const authorVoiceChannel = message.member?.voice.channel;

    // delete previous lfs embeds
    const textChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
    if (textChannel.isText()) {
      const messages = await textChannel.messages.fetch();
      await deleteAllLfsAuthorEmbeds(message.author.id, messages);
    }

    if (authorVoiceChannel && authorVoiceChannel.members.size > 0) {
      const authorVoiceChannelUsersDiscordIds = authorVoiceChannel?.members.map((member) => member.user.id);
      const channelUsersDocuments = await User.find({ discordId: { $in: authorVoiceChannelUsersDiscordIds } });
      const channelUsersWithStats = computeChannelUsers(
        authorVoiceChannel?.members,
        channelUsersDocuments,
        message.author.id,
      );
      const embed = await message.channel.send(
        EmbedLookingForSomeone(message, channelUsersWithStats, authorVoiceChannel),
      );
      await embed.react('✉️');
    } else {
      const authorDocument = await User.findOne({ discordId: message.author.id });
      const users = [computeUserPartialFromDocument(message.author.id, authorDocument)];
      const embed = await message.channel.send(EmbedLookingForSomeone(message, users));
      await embed.react('👍');
    }
  },
  '-': async (client, message) => {
    if (message.channel.id !== process.env.LFS_CHANNEL_ID) return;

    await message.delete();
    const channel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
    if (channel.isText()) {
      const messages = await channel.messages.fetch();
      // find last embed initiated by the author and delete
      const authorEmbedsMessages = messages.filter(
        (m) => m.author.bot && m.embeds.length > 0 && parseAuthorIdFromLfsEmbed(m.embeds[0]) === message.author.id,
      );
      const firstAuthorEmbedMessage = authorEmbedsMessages.first();
      await firstAuthorEmbedMessage?.delete();
    }
  },
  '/link': async (client, message, argumentsParsed) => {
    const isLfsChannel = message.channel.id === process.env.ROLES_CHANNEL_ID;
    const isAdminChannel = message.channel.id === process.env.ADMIN_CHANNEL_ID;
    if (!isLfsChannel && !isAdminChannel) return;

    const pubgNickname = argumentsParsed._[1] || '';
    const discordId = argumentsParsed._[2] || '';
    const isAdminCommand = isAdminChannel && discordId;
    const command = isAdminChannel ? `\`/link NICK_DO_PUBG DISCORD_ID\`` : `\`/link NICK_DO_PUBG\``;

    if (pubgNickname === '') {
      throw new EmbedError(
        `<@${message.author.id}> para associar a conta é necessário dizer o nome no pubg, exemplo:  ${command}`,
      );
    }

    if (isAdminChannel && discordId === '') {
      throw new EmbedError(
        `<@${message.author.id}> para associar a conta de pubg **${pubgNickname}** no canal de admin é necessário dizer a quem queremos associar, exemplo:  ${command}`,
      );
    }

    const feedbackMessage = await message.channel.send('A associar contas...');

    const {
      newUser: { stats },
      oldUser,
    } = await User.linkPubgAccount({
      discordId: isAdminChannel ? discordId : message.author.id,
      pubgNickname,
      force: isAdminChannel,
    });

    await feedbackMessage.edit(
      EmbedSuccessMessage(
        isAdminCommand
          ? `Ligaste a conta [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) à conta de Discord <@${discordId}>`
          : `Ligaste a conta [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) à tua conta de Discord!`,
      ),
    );

    if (
      typeof stats?.bestRank === 'string' &&
      typeof stats?.avgDamage === 'number' &&
      typeof stats?.kd === 'number' &&
      typeof stats?.winRatio === 'number' &&
      message?.member
    ) {
      // remove roles from user that had the nickname before forced change
      if (isAdminCommand && oldUser?.discordId) {
        const oldMember = await message.guild?.members.fetch(oldUser.discordId);
        if (oldMember) {
          await removeRoles(oldMember);
          await message.channel.send(`Roles de <@${oldUser.discordId}> removidas.`);
        }
      }

      const linkedDiscordId = isAdminCommand ? discordId : message.author.id;
      let member: GuildMember | undefined = message.member;
      if (isAdminCommand) {
        member = await message.guild?.members.fetch(discordId);
      }
      if (!member) throw new EmbedError('Utilizador não encontrado no servidor');
      await addStatsRoles(member, stats);
      const messageStats = `<@${linkedDiscordId}>, **Modo**: Squad-FPP, **Rank** (maior): ${stats.bestRank}, **ADR**: ${stats.avgDamage}, **K/D**: ${stats.kd}, **WR**: ${stats.winRatio}%.`;
      await feedbackMessage.edit(messageStats);
    }
  },
  '/unlink': async (client, message, argumentsParsed) => {
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
  },
  '/update': async (client, message) => {
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
  },
  '/help': async (client, message) => {
    await message.delete();
    await message.author.send(EmbedHelp());
  },
};

export const COMMANDS = Object.keys(resolvers);

export const commandsResolver = async (client: Client, message: Message) => {
  const isAdminChannel = message.channel.id === process.env.ADMIN_CHANNEL_ID;
  const commandArgv = argv(message.content);

  const [command] = commandArgv._;
  if (!COMMANDS.includes(command)) return null;

  try {
    AntiSpam.log(message.author.id, message.content);
    const isSpamDetected = await AntiSpam.checkMessageInterval(message); // Check sent messages interval
    if (isSpamDetected) {
      await message.delete();
      await message.author.send(`<@${message.author.id}>, por favor evita o spam de comandos.`);
      throw new Error(`Spam detected: ${message.content} by ${message.author.id}`);
    }

    const resolver = resolvers[command];
    await resolver(client, message, commandArgv);
  } catch (err) {
    if (err.name === 'EmbedError' || isAdminChannel) {
      await message.channel.send(EmbedErrorMessage(err.message));
    } else console.error(`Error running command resolver: "${command}"`, err.message);
  }
};
