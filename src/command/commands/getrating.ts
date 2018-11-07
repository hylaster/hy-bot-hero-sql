import { Command } from '../command';
import { initUserIfUnranked } from '../shared/initUserIfUnranked';

export const GetRating: Command = async (context) => {
  const { message, dataService } = context;

  const user = message.mentions.members.first().user;
  const serverId = message.guild.id;

  await initUserIfUnranked(user, message, serverId, 1000, dataService);
};
