import { Command, CommandHelpInfo } from '../command';
import { UserRatingPair, DataService } from 'src/data/data-service';
import { Client, Message } from 'discord.js';

export class GetTop implements Command {

  constructor(private prefix: string, private dataService: DataService, private client: Client) { }

  name = 'gettop';

  helpInfo: CommandHelpInfo = {
    description: "Get's a player's ranking.",
    argSpecs: [
      { name: 'User', description: 'A mention for a user them (i.e. @ someone).' }
    ],
    examples: [`${this.prefix + this.name} @ELO Bot`]
  };

  execute = async (message: Message, _args: string[]) => {

    const topUsers: UserRatingPair[] = await this.dataService.getTopNPlayers(message.guild.id, 2);
    const rankOne: UserRatingPair | undefined = topUsers[0];
    const rankTwo: UserRatingPair | undefined = topUsers[1];

    if (rankOne && rankTwo) {
      message.channel.send(`Top rating is ${this.client.users.get(rankOne.userId)} at ${rankOne.rating}
                2nd place is ${this.client.users.get(rankTwo.userId)} at ${rankTwo.rating}`);
    } else {
      message.channel.send('There are less than two users ranked..');
    }
  }
}
