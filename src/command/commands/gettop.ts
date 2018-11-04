import { Command } from '../command';
import { Client, Message } from 'discord.js';
import { DataService, TopTwo } from '../../data/dataservice';

export const GetTop: Command = (client: Client, message: Message, _args: string[], dataService: DataService) => {
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
