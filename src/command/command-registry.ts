import { Command } from './command';

export class CommandRegistry {

  private nameMap = new Map<string, Command>();

  registerCommand(command: Command | Command[]) {
    if (!Array.isArray(command)) {
      command = Array(command);
    }

    command.forEach(c => this.nameMap.set(c.name, c));
  }

  getCommand = (name: string) => this.nameMap.get(name);
  commandWithNameExists = (name: string) => this.nameMap.has(name);
  getCommandNames = () => [...this.nameMap.keys()];
  getCommands = () => [...this.nameMap.values()];
}
