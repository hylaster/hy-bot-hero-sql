import { Command } from './command';
import { Client, Message } from 'discord.js';
import { DataService } from '../data/dataservice';
import { getOrInitRanking } from './shared/getOrInitRanking';

const comm: Command = (client: Client, message: Message, args: string[], dataService: DataService) => {
  const user = message.mentions.members.first().user;
  const serverId = message.guild.id;

  getOrInitRanking(user, message, serverId, 1000, dataService);
};

export default comm;
