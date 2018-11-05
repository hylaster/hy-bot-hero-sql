import { Command } from '../command';

export const Ping: Command = (context) => {
  context.message.channel.send('pong!').catch(console.error);
};
