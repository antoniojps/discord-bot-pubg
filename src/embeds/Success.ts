import { MessageEmbed } from 'discord.js';

export const EmbedSuccessMessage = (content: string) => {
  return new MessageEmbed().setColor('#2FCC71').setDescription(content);
};
