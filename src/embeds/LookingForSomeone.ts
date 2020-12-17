import { MessageEmbed, Message, VoiceChannel } from 'discord.js';
import { UserPartial } from './../models/user';

export const EmbedLookingForSomeone = (message: Message, users?: UserPartial[], channel?: VoiceChannel | null) => {
  const usersList = users?.map((user) => {
    if (user.pubgNickname === '' || user.stats === undefined) return `\n<@${user.discordId}> ¯\\_(ツ)_/¯`;
    return `\n**[${user?.pubgNickname}](https://pubg.op.gg/user/${user?.pubgNickname})** - ${user?.stats?.bestRank}, KD ${user?.stats?.kd}, ADR ${user?.stats?.avgDamage}, WR ${user?.stats?.winRatio}%`;
  });

  const missingPlayers = users && users.length ? ` +${4 - users.length} ` : ' ';
  const title = channel ? `Procura${missingPlayers}jogadores - #${channel.name}` : `Procura${missingPlayers}jogadores`;
  const conclusion = channel ? `Para te juntares reaje com ✉️ ou envia PM <@${message.author.id}>` : '';

  const Embed = new MessageEmbed()
    .setColor('#0099ff')
    .setDescription(
      `
        ${usersList}

        ${conclusion}
      `,
    )
    .setFooter('lfs')
    .setTimestamp();

  if (channel)
    Embed.setThumbnail('https://i.imgur.com/wSTFkRM.png').setAuthor(
      title,
      `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=128`,
    );
  return Embed;
};
