import Discord from 'discord.js';
import { DataService } from './data/dataservice';
import { HyBotConfig } from './hybot-config';
import { Command } from './command/command';

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

    if (!message.content.startsWith(this.config.prefix) || message.author.bot) return;

    const words: string[] = message.content.slice(this.config.prefix.length).trim().split(/ +/g);

    if (words == null || words.length === 0) return;

    const commandName = words[0] == null ? null : words[0].toLowerCase();
    const args = words.splice(1);

    if (commandName == null) return;
    if (commandName.charAt(0) === '.') {
      message.channel.send('Invalid command.');
    } else {
      const command: Command = require(`./commands/${commandName}.js`);
      if (command != null) {
        command(this.client, message, args, this.dataService);
      } else {
        message.channel.send('Command not found.');
      }
    }
  }
}