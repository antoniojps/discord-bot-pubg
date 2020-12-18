import { Client } from 'discord.js';
import dotenv from 'dotenv';
import { commandsResolver } from './resolvers/commands';
import { reactionsResolver } from './resolvers/reactions';
import { voiceResolver } from './resolvers/voice';
import mongo from './services/database';
import setupRoles from './services/roles';

dotenv.config();
const client = new Client({ partials: ['GUILD_MEMBER', 'USER', 'REACTION'] });

client.login(process.env.DISCORDJS_BOT_TOKEN);

client.on('ready', async () => {
  console.log(`${client?.user?.tag} has logged in.`);

  // connect to db
  await mongo();

  // setup roles
  const guild = process.env.DISCORD_SERVER_ID ? await client.guilds.fetch(process.env.DISCORD_SERVER_ID) : null;
  if (!guild) throw new Error('Invalid guild ID');
  await setupRoles(guild);
});

client.on('error', (error) => {
  console.error(error);
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  commandsResolver(client, message);
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  const messageIsEmbed = Boolean(reaction.message.embeds.length > 0);

  if (messageIsEmbed) {
    reactionsResolver(client, reaction, user);
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  await voiceResolver(client, oldState, newState);
});
