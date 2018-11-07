import { Command } from '../command';

export const ResetRank: Command = async (context) => {
  const { message, dataService, config } = context;

  if (config.owners.includes(message.author.id)) {
    message.channel.send("Only the bot owner may reset a player's ranking.");
    return;
  }

  const member = message.mentions.members.first().user;
  if (!member) {
    message.channel.send('Please tag a user.');
  } else {
    const userId = member.id;
    const server = message.guild.id;

    const userIsRated = await dataService.isUserRated(userId, server);

    if (userIsRated) {
      dataService.updateRating(userId, 1000, server).then((newRanking: number) => {
        message.channel.send(`Ranking reset to ${newRanking}`);
      });
    } else {
      message.channel.send('User is not rated.');
    }
  }
};
