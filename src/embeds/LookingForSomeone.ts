import { MessageEmbed } from 'discord.js';
import { Stats, StatsPartial } from './../services/pubg';

const inProgressMedia = [
  'https://media2.giphy.com/media/l3mZfUQOvmrjTTkiY/giphy.gif',
  'https://media.giphy.com/media/3oKIPmaM8aFolCcuI0/giphy.gif',
  'https://media1.giphy.com/media/3ohs7YomxqOz4GRHcQ/giphy.gif',
  'https://media1.giphy.com/media/3ohzdOE33hBQ7duPfi/giphy.gif',
  'https://media.giphy.com/media/qlCFjkSruesco/giphy.gif',
  'https://media.giphy.com/media/3oKIP5KxPss1gjwpG0/giphy.gif',
];

const missingPlayersMedia: { [key: number]: string } = {
  1: 'https://i.imgur.com/TvqWGPH.png',
  2: 'https://i.imgur.com/S8jNcjs.png',
  3: 'https://i.imgur.com/cx62O1M.png',
};

export type Author = {
  id: string;
  avatar: string | null;
};

export type Channel = {
  id: string | null;
  name: string | null;
};

export type LfsUsers =
  | {
      pubgNickname: string;
      discordId: string | null;
      stats?: Stats | StatsPartial | null;
    }[]
  | undefined;

export enum EmbedType {
  lfs = 'lfs',
  cancelado = 'cancelado',
}

export type LfsEmbedProps = {
  author: Author;
  channel?: Channel | null;
  note?: string;
  users: LfsUsers;
  footer?: EmbedType;
};

export const NOT_FOUND_MESSAGE = '¯\\_(ツ)_/¯';

const computeConclusion = (type: EmbedType, users: LfsUsers, authorId: string, channel?: Channel | null) => {
  if (users && users.length >= 4) return ``;
  if (type === EmbedType.cancelado) return `Pedido de procura de jogadores cancelado.`;
  return channel
    ? `Para te juntares reaje com ✉️ ou envia PM <@${authorId}>`
    : `Para convidar entra num canal e reaje com 👍 ou envia PM <@${authorId}>`;
};

export const EmbedLookingForSomeone = ({ author, channel, users, note, footer }: LfsEmbedProps) => {
  const usersList = users?.map((user) => {
    if (user.pubgNickname === '' || user.stats === undefined) return `\n<@${user.discordId}>${NOT_FOUND_MESSAGE}`;
    return `\n**[${user?.pubgNickname}](https://pubg.op.gg/user/${user?.pubgNickname}?discordId=${user.discordId}&nick=${user?.pubgNickname})** - ${user?.stats?.bestRank}, KD ${user?.stats?.kd}, ADR ${user?.stats?.avgDamage}, WR ${user?.stats?.winRatio}%`;
  });

  const missingPlayers = users ? 4 - users.length : 0;
  const missingPlayersContent = users && users.length ? ` +${4 - users.length} ` : ' ';

  const title = missingPlayers > 0 ? `Procura${missingPlayersContent}jogadores` : `Squad completa`;
  const titleChannel = channel ? `${title} - ${channel.name}` : title;
  const embedType = footer ?? EmbedType.lfs;
  const conclusion = computeConclusion(embedType, users, author.id, channel);

  const Embed = new MessageEmbed()
    .setColor('#0099ff')
    .setDescription(
      `
        ${usersList}

        ${conclusion}
        ${note ? `> ${note}` : ''}
      `,
    )
    .setFooter(footer ?? EmbedType.lfs)
    .setTimestamp();

  const thumbnail =
    missingPlayers > 0
      ? missingPlayersMedia[missingPlayers]
      : inProgressMedia[Math.floor(Math.random() * inProgressMedia.length)];

  if (channel) {
    Embed.setThumbnail(thumbnail).setAuthor(
      titleChannel,
      author.avatar
        ? `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=128&channelId=${
            channel.id
          }&channelName=${encodeURIComponent(channel.name ?? '')}`
        : `https://i.imgur.com/cqmAKYJ.png?channelId=${channel.id}&channelName=${encodeURIComponent(
            channel.name ?? '',
          )}`,
    );
  }
  return Embed;
};
