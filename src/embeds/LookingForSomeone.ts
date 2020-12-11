import { MessageEmbed, Message } from 'discord.js'

export const EmbedLookingForSomeone = (message: Message) => {
  return new MessageEmbed()
	.setColor('#0099ff')
  .setAuthor(`${message.author.username} looking for players`, `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=128`,)
  .setDescription(`
    [${message.author.username}](https://pubg.op.gg/user/${message.author.username}) - Diamond, KD 1.7+, WR 12%
    [${message.author.username}](https://pubg.op.gg/user/${message.author.username}) - Diamond, KD 1.7+, WR 12%
    [${message.author.username}](https://pubg.op.gg/user/${message.author.username}) - Diamond, KD 1.7+, WR 12%

    Para te juntares manda PM <@${message.author.id}> :incoming_envelope:
  `)
  .setThumbnail('https://i.imgur.com/wSTFkRM.png')
  .setFooter("lfs")
}