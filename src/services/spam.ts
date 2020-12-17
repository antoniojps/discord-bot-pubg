import { MessageEmbed, Message } from 'discord.js';

type Authors = {
  time: number;
  author: string;
}[];

type MessageLogs = {
  message: string;
  author: string;
}[];

class AntiSpam {
  authors: Authors;
  messageLog: MessageLogs;
  interval: number;

  constructor() {
    this.authors = [];
    this.messageLog = [];
    this.interval = 5000;
  }

  private logAuthor(authorId: string) {
    return this.authors.push({
      time: Math.floor(Date.now()),
      author: authorId,
    });
  }
  private logMessage(authorId: string, message: string) {
    return this.messageLog.push({
      message,
      author: authorId,
    });
  }

  public log(authorId: string, message: string) {
    this.logAuthor(authorId);
    this.logMessage(authorId, message);
  }

  private matchMessages(msg: Message) {
    if (msg.author.bot) {
      return;
    }
    let msgMatch = 0;
    this.messageLog.forEach((log) => {
      if (log.message === msg.content && log.author === msg.author.id) {
        msgMatch++;
      }
    });

    return msgMatch;
  }
  public checkMessageInterval(msg: Message) {
    return new Promise((resolve) => {
      if (msg.author.bot) {
        resolve(false);
      }
      const now = Date.now();
      const msgsMatched = this.matchMessages(msg);
      let spamDetected = false;
      if (msgsMatched && msgsMatched >= 2) {
        for (let i = 0; i < this.authors.length; i++) {
          if (this.authors[i].time > now - this.interval) {
            spamDetected = true;
          } else if (this.authors[i].time < now - this.interval) {
            this.messageLog.splice(this.messageLog.findIndex((message) => message.author === this.authors[i].author));
            this.authors.splice(i);
          }
          if (this.messageLog.length >= 200) {
            this.messageLog.shift();
          }
        }
      }
      resolve(spamDetected);
    });
  }
}

export default new AntiSpam();
