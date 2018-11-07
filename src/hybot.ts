import Discord from 'discord.js';
import { DataService } from './data/dataservice';
import { HyBotConfig } from './config/hybot-config';
import { Command, CommandContext } from './command/command';
import { getCommand } from './command/location';
import { CommandMessageParts, parseCommand } from './command/message-parser';

export interface ConnectResponse {
  token: string;
  botUsername: string;
}

export class HyBot {

  private client?: Discord.Client;

  public constructor(private config: HyBotConfig, private dataService: DataService) {}

  public connect(): Promise<ConnectResponse> {
    const client = new Discord.Client(this.config.clientConfig);

    this.client = client;

    return new Promise<ConnectResponse>((resolve,reject) => {
      client.login(this.config.token)
        .then(token => {
          client.on('message', this.processMessage.bind(this));
          resolve({ token, botUsername: client.user.username });
        }).catch(err => reject(err));
    });
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

    const command: Command | undefined = getCommand(messageParts.commandName);

    if (command == null) {
      message.channel.send(`There is no *${messageParts.commandName}* command.`);
    } else {
      const context: CommandContext = {
        client: this.client,
        message,
        args: messageParts.args,
        dataService: this.dataService,
        config: this.config
      };
      command(context).catch(err => {
        message.channel.send('Sorry, something went wrong.');
        console.log(err);
      });
    }
  }

  private messageIsIntendedForBot(message: Discord.Message) {
    return message.content.startsWith(this.config.prefix);
  }

}
