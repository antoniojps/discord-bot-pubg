import { MessageEmbed } from 'discord.js';

export const EmbedHelp = () => {
  return new MessageEmbed()
    .setColor('#FF0000')
    .setTitle(`PUBG PT Help`)
    .setThumbnail('https://pbs.twimg.com/profile_images/1143114325336494080/qGwbqNoz_400x400.jpg')
    .setDescription(
      `
    PUBG PT é um discord bot desenvolvido para a comunidade portuguesa de PUBG
    de modo a facilitar a procura de jogadores.
    `,
    )
    .addFields(
      {
        name: 'Setup inicial',
        value:
          'Escreve `/link PUBG_NICKNAME` substituindo `PUBG_NICKNAME` pelo nome da tua conta de modo a receber os roles e stats no discord.',
      },
      {
        name: 'Procura de jogadores',
        value: '`lfs` para iniciar uma procura por jogadores.\n`-` para cancelar a procura',
      },
      {
        name: 'Nova Season',
        value: '`/restart` no início de uma nova season dá restart às roles no discord (não remove stats)',
      },
      {
        name: 'Outros comandos',
        value:
          '`/update` para dar update aos stats e roles de um utilizador previamente linkado.\n`/help` para receber uma PM com um guia geral dos comandos do bot',
      },
    )
    .setTimestamp();
};
