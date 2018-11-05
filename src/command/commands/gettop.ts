import { Command } from '../command';
import { TopTwo } from '../../data/dataservice';

export const GetTop: Command = (context) => {
  const { client, message, dataService } = context;

  dataService.getTopTwoPlayers(message.guild.id).then((topTwo: TopTwo) => {
    const rankOne = topTwo.RankOne;
    const rankTwo = topTwo.RankTwo;

    if (rankOne && rankTwo) {
      message.channel.send(`Top rating is ${client.users.get(rankOne.userId)} at ${rankOne.rating}
                2nd place is ${client.users.get(rankTwo.userId)} at ${rankTwo.rating}`);
    } else {
      message.channel.send('There are less than two users.');
    }
  });
};
