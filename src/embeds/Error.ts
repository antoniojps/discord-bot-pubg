import { MessageEmbed } from 'discord.js';

export const EmbedErrorMessage = (content: string) => {
  return new MessageEmbed().setColor('#FF0000').setDescription(content);
};

export class EmbedError extends Error {
  constructor(message: string) {
    super(message); // (1)
    this.name = 'EmbedError'; // (2)
  }
}
