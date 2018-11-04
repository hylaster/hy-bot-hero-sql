import { Command } from '../command';

export const Ping: Command = (_client, message, _args) => {
  message.channel.send('pong!').catch(console.error);
};
