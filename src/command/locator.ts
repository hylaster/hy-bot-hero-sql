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
  export const getCommand = (name: string | CommandName) => commandMap.get(name as CommandName);
  export const commandWithNameExists = (name: string | CommandName) => commandMap.has(name as CommandName);
}
