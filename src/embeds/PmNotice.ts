import { MessageEmbed, VoiceChannel } from 'discord.js';

export const EmbedPmNotice = (authorId: string) => {
  return new MessageEmbed().setColor('#0099ff').setDescription(`
    O seu pedido foi enviado para <@${authorId}>. Aguarde uma resposta.
  `);
};

export const EmbedPmNoticeAccept = (authorId: string, channelName?: string, channelInvite?: string) => {
  return new MessageEmbed().setColor('#00FF6D').setDescription(`
    <@${authorId}> aceitou o pedido para jogar. ${
    channelInvite && channelName
      ? `Junta-te ao canal **${channelName}** ${channelInvite}`
      : `Entra em contacto com o jogador.`
  }
  `);
};

export const EmbedPmNoticeWelcome = (authorId: string, channelName?: string, channelInvite?: string) => {
  return new MessageEmbed().setColor('#00FF6D').setDescription(`
    <@${authorId}> convidou-te para jogar. Junta-te ao canal **${channelName}**
    ${channelInvite}
  `);
};

export const EmbedPmNoticeDecline = (authorId: string) => {
  return new MessageEmbed().setColor('#FF1700').setDescription(`
    Neste momento <@${authorId}> não está disponível para jogar.
  `);
};
