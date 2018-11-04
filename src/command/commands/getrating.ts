import { Command } from '../command';
import { Client, Message } from 'discord.js';
import { DataService } from '../../data/dataservice';
import { getOrInitRanking } from '../shared/getOrInitRanking';

export const GetRating: Command = (_client: Client, message: Message, _args: string[], dataService: DataService) => {
  const user = message.mentions.members.first().user;
  const serverId = message.guild.id;

  getOrInitRanking(user, message, serverId, 1000, dataService);
};
