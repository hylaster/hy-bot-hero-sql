import { Command, CommandHelpInfo } from '../command';
import EloRating from 'elo-rating';
import { Snowflake, Message } from 'discord.js';
import { DataService } from 'src/data/data-service';
import { getRatingOrDefault } from '../common/get-rating-or-default';

enum Outcome {
  Win = 'winvs',
  Loss = 'lossvs'
}

export class Record implements Command {
  public constructor(private prefix: string, private dataService: DataService) { }

  public name = 'record';

  public helpInfo: CommandHelpInfo = {
    description: 'Records a match between you in an opponent.',
    argSpecs: [
      { name: 'outcome', description: `'${Outcome.Win}' if you won, or '${Outcome.Loss}' if you lost.` },
      { name: 'user', description: `mention the user you played against (i.e. @ them)` }
    ],
    examples: [
      `${this.prefix + this.name} ${Outcome.Win} @SomeUser`,
      `${this.prefix + this.name} ${Outcome.Loss} @SomeUser`
    ]
  };

  public async action(message: Message, args: string[]) {
    const result = args[0].toLowerCase();

    if (result !== Outcome.Win && result !== Outcome.Loss) {
      message.channel.send(`First parameter should be ${Outcome.Win} or ${Outcome.Loss}`);
      return;
    }

    const opponent = message.mentions.members.first().user;
    const author = message.author;
    if (opponent == null) {
      message.channel.send('Specify who your opponent was by mentioning your opponent as the second argument (e.g. @MyOpponent)');
      return;
    }

    if (opponent.id === message.author.id) {
      message.channel.send('Sorry, but playing with yourself is against the rules.');
      return;
    } else if (opponent.bot) {
      message.channel.send("Bots wouldn't mind battling you, but you would lose in six turns, which is a bit too quick for our tastes.");
      return;
    }

    const winner = result === Outcome.Win ? author : opponent;
    const today = new Date();
    const server = message.guild.id;

    const bothEligible = await this.dataService.areUsersEligibleForMatch(author.id, opponent.id, server, today);
    if (bothEligible) {
      await Promise.all([this.recordMatch(author.id, opponent.id, server, today, winner.id, author.id, this.dataService),
        this.updateRatings(author.id, opponent.id, server, winner.id, this.dataService)]);

      message.channel.send(`Recording ${message.author.username}'s ${result} ${opponent}`);
    } else {
      message.channel.send('You two can have fun with each other, but can only record one match with each other per day.');
    }
  }

  private getRatingsAfterMatch(winnersRating: number, losersRating: number) {
    const eloResults = EloRating.calculate(winnersRating, losersRating, true);
    return {
      winnersNewRating: eloResults.playerRating,
      losersNewRating: eloResults.opponentRating
    };
  }

  private async updateRatings(author: Snowflake, opponent: Snowflake, server: Snowflake,
    winner: Snowflake, dataService: DataService) {

    const [authorRating, opponentRating] = await Promise.all([getRatingOrDefault(author, server, dataService),
      getRatingOrDefault(opponent, server, dataService)]);

    const { winnersNewRating: newAuthorRating,
      losersNewRating: newOpponentRating } = winner === author
        ? this.getRatingsAfterMatch(authorRating, opponentRating)
        : this.getRatingsAfterMatch(opponentRating, authorRating);

    await Promise.all([dataService.setRating(author, server, newAuthorRating),
      dataService.setRating(opponent, server, newOpponentRating)]);
  }

  private async recordMatch(authorId: Snowflake, opponentId: Snowflake, server: Snowflake, date: Date,
    winner: Snowflake, author: Snowflake, dataService: DataService) {
    return dataService.addMatch(authorId, opponentId, server, date, winner, author);
  }

}
