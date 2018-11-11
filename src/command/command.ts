import { Message } from 'discord.js';

export interface CommandArgSpec {
  name: string;
  description: string;
}

export interface Command {
  name: string;
  helpInfo?: CommandHelpInfo;
  execute: (message: Message, args: string[]) => Promise<void>;
}

export interface CommandHelpInfo {
  description: string;
  argSpecs: CommandArgSpec[];
  examples: string[];
}
