import * as Commands from './commands';
import { CommandName } from './names';
import { Command } from './command';

const commandMap: Map<CommandName, Command> = new Map([
  [CommandName.GetRating, Commands.GetRating],
  [CommandName.GetTop, Commands.GetTop],
  [CommandName.Ping, Commands.Ping],
  [CommandName.Record, Commands.Record],
  [CommandName.ResetRank, Commands.ResetRank],
  [CommandName.Roll, Commands.Roll],
  [CommandName.Timer, Commands.Timer]
]);

export namespace CommandLocator {
  /**
   * fuk
   * @param name The name of the command, as it would be entered by a user.
   */
  export const getCommand = (name: string) => commandMap.get(name as CommandName);

  export const commandWithNameExists = (name: string) => commandMap.has(name as CommandName);
}
