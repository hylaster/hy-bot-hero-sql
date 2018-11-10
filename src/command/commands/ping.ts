import { Command } from '../command';
import { Message } from 'discord.js';

export class Ping implements Command {
  name = 'ping';

  helpText = "I'll say pong if you say ping.";

  async execute(message: Message, _args: string[]) {
    message.channel.send('pong!');
  }
}
