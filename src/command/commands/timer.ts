import { Command } from '../command';
import { Client, Message } from 'discord.js';
import { DataService } from '../../data/dataservice';

export const Timer: Command = (_client: Client, message: Message, args: string[], _dataService: DataService) => {
  const time = Number(args[0]) * 1000;
  const author = message.author;
  setTimeout(function() {
    message.channel.send(`${author}'s timer of length ${args[0]} seconds has reached zero.`);
  }, time);
};
