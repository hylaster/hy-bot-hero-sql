import { Command } from '../command';
import { Message } from 'discord.js';
import dedent = require('dedent');

export class Timer implements Command {

  constructor(private prefix: string) {}

  name = 'timer';

  helpText = dedent`Set a timer for some number of seconds.
                    Example: *${this.prefix + this.name} 60*`;

  async execute(message: Message, args: string[]) {
    const time = Number(args[0]) * 1000;
    const author = message.author;
    setTimeout(function () {
      message.channel.send(`${author}'s timer of length ${args[0]} seconds has reached zero.`);
    }, time);
  }
}
