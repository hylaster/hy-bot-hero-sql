import Discord, { Client } from 'discord.js';
import { HyBotConfig } from './config/hybot-config';
import { Command } from './command/command';
import { CommandMessageParts, parseCommand } from './command/message-parser';
import { CommandRegistry } from './command/command-registry';

export class HyBot {

  private client?: Discord.Client;
  public commandRegistry = new CommandRegistry();

  public constructor(private config: HyBotConfig) {}

  public async connect(): Promise<Client> {
    const client = new Discord.Client(this.config.clientConfig);
    await client.login(this.config.token);
    this.client = client;
    client.on('message', this.processMessage.bind(this));

    return client;
  }

  public isConnected() {
    if (this.client == null) {
      return false;
    } else {
      return this.client.status === (Discord as any).Constants.Status.READY;
    }
  }

  public disconnect() {
    if (this.client != null) this.client.destroy();
  }

  private processMessage(message: Discord.Message) {
    if (this.client == null || this.client.status === (Discord as any).Constants.Status.DISCONNECTED) {
      throw new Error('Attempted to process a message without a connected client.');
    }
    if (!this.messageIsIntendedForBot(message)) return;

    const messageParts: CommandMessageParts | undefined =
        parseCommand(this.config.prefix, message);

    if (messageParts == null) return;

    const command: Command | undefined = this.commandRegistry.getCommandByName(messageParts.commandName);

    if (command == null) {
      message.channel.send(`There is no *${messageParts.commandName}* command.`);
    } else {
      command.action(message, messageParts.args).catch(err => {
        message.channel.send('Sorry, something went wrong.');
        console.log(err);
      });
    }
  }

  private messageIsIntendedForBot(message: Discord.Message) {
    return message.content.startsWith(this.config.prefix);
  }
}
