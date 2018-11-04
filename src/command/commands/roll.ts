import { Command } from '../command';
import { Client, Message } from 'discord.js';
import { DataService } from '../../data/dataservice';

export const Roll: Command = (_client: Client, message: Message, args: string[], _dataService: DataService) => {
  const sendInvalidArgsString = () => {
    message.channel.send('Please enter a valid dice string. Examples include 3d6, 2d4+3, 6d4-6');
  };

  if (args.length < 1) {
    sendInvalidArgsString();
    return;
  }

  const dieRegex: RegExp = /(\d+)d(\d+)([+-]\d+)?/;

  const diceString = args.join('').trim(); // to allow for optional spaces in dice string

  const matches = diceString.match(dieRegex);

  if (matches == null) {
    sendInvalidArgsString();
    return;
  }

  const numDice = parseInt(matches[1]);
  const numFaces = parseInt(matches[2]);
  const modifier = (matches[3] != null) ? parseInt(matches[3]) : 0;

  const results = [];
  let total = Number(modifier);
  for (let die = 0; die < numDice; die++) {
    const n = Math.floor(Math.random() * numFaces + 1);
    results.push(n);
    total += n;
  }

  message.channel.send(`Results: ${results.join(' ')} | Total With Modifier: ${total}`);
};
