import { Message } from 'discord.js';

export interface CommandMessageParts {
  commandName: string;
  args: string[];
}

export namespace MessageParser {
  export function parseCommand(prefix: string, message: Message): CommandMessageParts | undefined {
    const words: string[] = message.content.slice(prefix.length).trim().split(/ +/g);

    if (words == null || words.length === 0) return undefined;

    const commandName = words[0].toLowerCase();
    const args = words.splice(1);
    const parts: CommandMessageParts = { commandName, args };
    return parts;
  }
}
