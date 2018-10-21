import { Command } from './command';
import { DataService } from '../data/dataservice';

const config = require('../config.json');

const comm: Command = (client, message, args, dataService: DataService) => {
  if (message.author.id !== config.owner) {
    message.channel.send("Only the bot owner may reset a player's ranking.");
    return;
  }

  let member = message.mentions.members.first().user;
  if (!member) {
    message.channel.send('Please tag a user.');
  } else {
    dataService.updateRating(member.id, 1000, message.guild.id).then((newRanking: number) => {
      message.channel.send(`Ranking reset to ${newRanking}`);
    });
  }
};

export default comm;
