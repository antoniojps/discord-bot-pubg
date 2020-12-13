import { MessageEmbed } from 'discord.js';

export const EmbedPmRequest = (authorId: string) => {
  return new MessageEmbed()
    .setColor('#0099ff')
    .setDescription(`O jogador <@${authorId}> está disponível para jogar.`)
    .setFooter('lfs')
    .setTimestamp();
};
