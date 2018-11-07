import { Command } from '../command';
import { getRatingOrDefault } from '../shared/getRatingOrDefault';

export const GetRating: Command = async (context) => {
  const { message, dataService } = context;

  const firstMention = message.mentions.members.first();

  if (firstMention == null) {
    message.channel.send('Specify who your opponent was by mentioning your opponent as the second argument (e.g. @MyOpponent)');
    return;
  }

  const user = firstMention.user;
  const serverId = message.guild.id;
  const rating = await getRatingOrDefault(user.id, serverId, dataService);

  message.channel.send(`${user.username}'s rating is ${rating}.`);
};
