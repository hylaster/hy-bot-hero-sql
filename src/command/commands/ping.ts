import { Command } from '../command';

export const Ping: Command = async (context) => {
  context.message.channel.send('pong!').catch(console.error);
};
