import { MessageEmbed } from 'discord.js'

export const EmbedPmNotice = (authorId: string) => {
  return new MessageEmbed()
	.setColor('#0099ff')
  .setDescription(`
    O seu pedido foi enviado para <@${authorId}> . Aguarde uma resposta.
  `)
}
