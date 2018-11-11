import { Command, CommandHelpInfo } from '../command';
import { Message } from 'discord.js';

export class Ping implements Command {
  name = 'ping';

  helpInfo: CommandHelpInfo = {
    description: "If you say ping I'll say pong.",
    argSpecs: [],
    examples: []
  };

  async execute(message: Message, _args: string[]) {
    message.channel.send('pong!');
  }
}
