import { Message } from 'discord.js';

/**
 * A bot command that can be used for users to perform bot actions.
 */
export interface Command {
  name: string;
  helpInfo?: CommandHelpInfo;
  action: (message: Message, args: string[]) => Promise<void>;
}

/**
 * The specification for a bot command argument.
 */
export interface CommandArgSpec {
  name: string;
  description: string;
}

/**
 * Contains information used to generate a help message explaining what the command
 * does and how to use it.
 */
export interface CommandHelpInfo {
  description: string;
  argSpecs: CommandArgSpec[];
  examples: string[];
}
