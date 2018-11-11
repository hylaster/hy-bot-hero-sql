import { Command, CommandHelpInfo } from '../command';
import dedent = require('dedent');
import { Message, Snowflake } from 'discord.js';
import { DataService } from 'src/data/data-service';

export class ResetRank implements Command {
  constructor(private commandPrefix: string, private authorizedUsers: Snowflake[],
              private dataService: DataService) {}

  name = 'resetrank';

  helpInfo: CommandHelpInfo = {
    description: "Resets a player's rank. Can only be used by one of the authorized users: ",
    argSpecs: [
      { name: 'user', description: `player that will have their rank reset.` }
    ],
    examples: []
  };

  helpText = dedent`Resets a player's rank. Only the bot owner(s) can use this command.
                    Example: *${this.commandPrefix + this.name} @SomeUser*`;

  async execute(message: Message, _args: string[]) {
    {
      if (this.authorizedUsers.includes(message.author.id)) {
        message.channel.send("Only the bot owner may reset a player's ranking.");
        return;
      }

      const member = message.mentions.members.first().user;
      if (!member) {
        message.channel.send('Please tag a user.');
      } else {
        const userId = member.id;
        const server = message.guild.id;

        const userIsRated = await this.dataService.isUserRated(userId, server);

        if (userIsRated) {
          this.dataService.setRating(userId, 1000, server).then((newRanking: number) => {
            message.channel.send(`Ranking reset to ${newRanking}`);
          });
        } else {
          message.channel.send('User is not rated.');
        }
      }
    }
  }
}
