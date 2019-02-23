import { Command, CommandHelpInfo } from '../command';
import { Message } from 'discord.js';

export class Ping implements Command {
  public name = 'ping';

  public helpInfo: CommandHelpInfo = {
    description: "If you say ping I'll say pong.",
    argSpecs: [],
    examples: []
  };

  public async action(message: Message, _args: string[]) {
    message.channel.send('pong!');
  }
}
