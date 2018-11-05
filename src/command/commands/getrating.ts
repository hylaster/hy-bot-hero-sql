import { Command } from '../command';
import { getOrInitRanking } from '../shared/getOrInitRanking';

export const GetRating: Command = (context) => {
  const { message, dataService } = context;

  const user = message.mentions.members.first().user;
  const serverId = message.guild.id;

  getOrInitRanking(user, message, serverId, 1000, dataService);
};
