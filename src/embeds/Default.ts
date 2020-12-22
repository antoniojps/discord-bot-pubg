import { MessageEmbed } from 'discord.js';

export const EmbedDefaultMessage = (content: string) => {
  return new MessageEmbed().setColor('#0099ff').setDescription(content);
};
