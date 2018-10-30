import { Command } from './command';

export const Ping: Command = (client, message, args) => {
  message.channel.send('pong!').catch(console.error);
};
