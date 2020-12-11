import { MessageEmbed } from 'discord.js'

export const EmbedPmRequest = (authorId: string) => {
  return new MessageEmbed()
	.setColor('#0099ff')
  .setDescription(`
    O jogador <@${authorId}> está pronto para jogar. Reaje a esta mensagem com :white_check_mark: para aceitar o pedido.
  `)
}