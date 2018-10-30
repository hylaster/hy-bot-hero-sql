import { Command } from '../command';
import { DataService } from '../../data/dataservice';

const config = require('../config.json');

export const ResetRank: Command = (client, message, args, dataService: DataService) => {
  if (message.author.id !== config.owner) {
    message.channel.send("Only the bot owner may reset a player's ranking.");
    return;
  }

  let member = message.mentions.members.first().user;
  if (!member) {
    message.channel.send('Please tag a user.');
  } else {
    const userId = member.id;
    const server = message.guild.id;

    dataService.isUserRated(userId, server)
    .then((userIsRated) => {
      if (userIsRated) {
        dataService.updateRating(userId, 1000, server).then((newRanking: number) => {
          message.channel.send(`Ranking reset to ${newRanking}`);
        });
      } else {
        message.channel.send('User is not rated.');
      }
    });
  }
};
