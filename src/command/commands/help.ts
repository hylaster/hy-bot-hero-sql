import { Command } from '../command';
import dedent = require('dedent');
import { Message } from 'discord.js';
import { CommandRegistry } from '../command-registry';

export class Help implements Command {
  constructor(private commandRegistry: CommandRegistry) {}

  name = 'help';
  helpText = dedent`Type the same thing without the second *${this.name}* off to get a list of commands.
                    Or...replace the second *${this.name}* with another command name to get info on that command`;

  async execute(message: Message, args: string[]) {
    const channel = message.channel;
    if (args.length === 0) {
      const names = this.commandRegistry.getCommandNames();
      channel.send('Available commands: ' + names.join(', '));
    } else {
      const nameOfCommandInQuestion = args[0];
      const command = this.commandRegistry.getCommands().find(c => c.name === nameOfCommandInQuestion);

      if (command == null) {
        channel.send(`Didn't find a command with a name of *${nameOfCommandInQuestion}*.`);
      } else {
        channel.send(command.helpText);
      }
    }
  }
}
