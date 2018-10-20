import { Command } from './command';

const comm: Command = (client, message, args) => {
  message.channel.send('pong!').catch(console.error);
};

export default comm;
