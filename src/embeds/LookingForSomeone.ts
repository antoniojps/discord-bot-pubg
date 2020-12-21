import { MessageEmbed } from 'discord.js';
import { Stats, StatsPartial } from './../services/pubg';

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

export type LfsEmbedProps = {
  author: Author;
  channel?: Channel | null;
  users: LfsUsers;
};

export const NOT_FOUND_MESSAGE = '¯\\_(ツ)_/¯';

export const EmbedLookingForSomeone = ({ author, channel, users }: LfsEmbedProps) => {
  const usersList = users?.map((user) => {
    if (user.pubgNickname === '' || user.stats === undefined) return `\n<@${user.discordId}> ${NOT_FOUND_MESSAGE}`;
    return `\n**[${user?.pubgNickname}](https://pubg.op.gg/user/${user?.pubgNickname}?discordId=${user.discordId}&nick=${user?.pubgNickname})** - ${user?.stats?.bestRank}, KD ${user?.stats?.kd}, ADR ${user?.stats?.avgDamage}, WR ${user?.stats?.winRatio}%`;
  });

  const missingPlayers = users ? 4 - users.length : 0;
  const missingPlayersContent = users && users.length ? ` +${4 - users.length} ` : ' ';
  const title = channel
    ? `Procura${missingPlayersContent}jogadores - ${channel.name}`
    : `Procura${missingPlayersContent}jogadores`;
  const conclusion = channel
    ? `Para te juntares reaje com ✉️ ou envia PM <@${author.id}>`
    : `Para convidar entra num canal e reaje com 👍 ou envia PM <@${author.id}>`;

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

  if (channel) {
    Embed.setThumbnail(missingPlayersMedia[missingPlayers]).setAuthor(
      title,
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
