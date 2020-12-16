import { Client, MessageReaction, User, PartialUser } from 'discord.js';
import { EmbedPmRequest } from '../embeds/PmRequest';
import { EmbedPmNotice, EmbedPmNoticeAccept } from '../embeds/PmNotice';
import { EmbedPmRequestAccept } from '../embeds/PmRequest';
import { parseAuthorIdFromLfsEmbed } from '../utils/embeds';
import { parseUserIdFromMention } from '../utils/helpers';

type ReactionResolver = (client: Client, reaction: MessageReaction, user: User | PartialUser) => Promise<void>;

type Resolvers = {
  '✉️': ReactionResolver;
  '✅': ReactionResolver;
  [key: string]: any;
};

export const resolvers: Resolvers = {
  '✉️': async (client, reaction, user) => {
    // make sure its in the LFS channel
    if (reaction.message.channel.id !== process.env.LFS_CHANNEL_ID) throw new Error('Forbidden: Invalid lfs channel');

    const [embed] = reaction.message.embeds;
    const embedType = embed.footer?.text;

    const authorEmbed: User | PartialUser | undefined = client.users.cache.find(
      (user) => user.id === parseAuthorIdFromLfsEmbed(embed),
    );
    const authorReaction: User | PartialUser = user;

    // most be a lfs embed and author different from "reactor"
    if (authorEmbed && authorEmbed?.id !== authorReaction.id && embedType === 'lfs') {
      await authorReaction.send(EmbedPmNotice(authorEmbed.id));
      const embedPmRequest = await authorEmbed.send(EmbedPmRequest(authorReaction.id));
      await embedPmRequest.react('✅');
      await embedPmRequest.react('❌');
    }
  },
  '✅': async (client, reaction, user) => {
    // make sure its in a PM
    if (reaction.message.channel.type !== 'dm') throw new Error('Forbidden: Invalid dm channel');

    const [embed] = reaction.message.embeds;
    const embedType = embed.footer?.text;

    if (embedType === 'lfs') {
      const lfsReactionAuthorId = embed.description ? parseUserIdFromMention(embed.description) : null;
      if (lfsReactionAuthorId && process.env.DISCORD_SERVER_ID) {
        await reaction.message.edit(EmbedPmRequestAccept(lfsReactionAuthorId));

        const lfsReactionAuthor = client.users.cache.find((user) => user.id === lfsReactionAuthorId);
        const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
        const member = await guild.members.fetch(user.id);
        const lfsAuthorChannel = member.voice.channel;
        const lfsAuthorChannelInvite = await lfsAuthorChannel?.createInvite();
        const lfsAuthorChannelName = lfsAuthorChannel?.toString();

        lfsReactionAuthor?.send(EmbedPmNoticeAccept(user.id, lfsAuthorChannelName, lfsAuthorChannelInvite?.url));
      }
    }
  },
};

export const REACTIONS = Object.keys(resolvers);

export const reactionsResolver = async (client: Client, reaction: MessageReaction, user: User | PartialUser) => {
  if (!REACTIONS.includes(reaction.emoji.name)) return null;

  try {
    const emoji = reaction.emoji.name;
    const resolver = resolvers[emoji];
    await resolver(client, reaction, user);
  } catch (err) {
    console.error(`Error running reaction resolver: "${reaction.emoji.name} - "`, err.message);
  }
};
