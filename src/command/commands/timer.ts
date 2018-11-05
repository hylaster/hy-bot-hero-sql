import { Command } from '../command';

export const Timer: Command = (context) => {
  const { message, args } = context;

  const time = Number(args[0]) * 1000;
  const author = message.author;
  setTimeout(function() {
    message.channel.send(`${author}'s timer of length ${args[0]} seconds has reached zero.`);
  }, time);
};
