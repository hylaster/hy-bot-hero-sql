import { Command } from './command';

/**
 * A simple collection object for bot commands.
 */
export class CommandRegistry {

  private nameMap = new Map<string, Command>();

  /**
   * Adds a command to this registry.
   * @param command The command to add.
   */
  public registerCommand(command: Command | Command[]) {
    if (!Array.isArray(command)) {
      command = Array(command);
    }

    command.forEach(c => this.nameMap.set(c.name, c));
  }

  /**
   * Removes a command from this registry.
   * @param command The `Command` to remove.
   */
  public unregisterCommand(command: Command | Command[]) {
    if (!Array.isArray(command)) {
      command = Array(command);
    }

    command.forEach(c => this.nameMap.delete(c.name));
  }

  /**
   * Look's up a `Command` by its name.
   * @param name The name of the command to search for.
   */
  public getCommandByName(name: string): Command | undefined {
    return this.nameMap.get(name);
  }

  /**
   * Determines whether or not a command with a given name exists.
   * @param name The name of the command to search for.
   * @returns  `true` if there exists a command with the given name, `false` otherwise.
   */
  public commandWithNameExists(name: string): boolean {
    return this.nameMap.has(name);
  }

  /**
   * Gets the name of commands registered.
   * @returns An `Array` of `Command` names.
   */
  public getCommandNames(): string[] {
    return [...this.nameMap.keys()];
  }

  /**
   * Gets the `Command`s registered.
   */
  public getCommands(): Command[] {
    return [...this.nameMap.values()];
  }
}
