import { Command } from '../command';
import { UserRatingPair } from 'src/data/dataservice';

export const GetTop: Command = async (context) => {
  const { client, message, dataService } = context;

  const topUsers: UserRatingPair[] = await dataService.getTopNPlayers(message.guild.id, 2);
  const rankOne: UserRatingPair | undefined = topUsers[0];
  const rankTwo: UserRatingPair | undefined = topUsers[1];

  if (rankOne && rankTwo) {
    message.channel.send(`Top rating is ${client.users.get(rankOne.userId)} at ${rankOne.rating}
                2nd place is ${client.users.get(rankTwo.userId)} at ${rankTwo.rating}`);
  } else {
    message.channel.send('There are less than two users ranked..');
  }
};
