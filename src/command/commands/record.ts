import { Command, CommandHelpInfo } from '../command';
import EloRating from 'elo-rating';
import { Snowflake, Message } from 'discord.js';
import { DataService } from 'src/data/data-service';
import { getRatingOrDefault } from '../common/get-rating-or-default';

/**
 * The textual representation of a user's match out come with another user.
 * One of these is provided as the first argument to command to indicate who
 * won the match.
 */
enum OutcomeArgumentValue {
  Win = 'winvs',
  Loss = 'lossvs'
}

/**
 * Command to record a match between two users and update their ratings.
 */
export class Record implements Command {
  public constructor(private prefix: string, private dataService: DataService) { }

  public name = 'record';

  public helpInfo: CommandHelpInfo = {
    description: 'Records a match between you and an opponent.',
    argSpecs: [
      { name: 'outcome', description: `'${OutcomeArgumentValue.Win}' if you won, or '${OutcomeArgumentValue.Loss}' if you lost.` },
      { name: 'user', description: `mention the user you played against (i.e. @ them)` }
    ],
    examples: [
      `${this.prefix + this.name} ${OutcomeArgumentValue.Win} @SomeUser`,
      `${this.prefix + this.name} ${OutcomeArgumentValue.Loss} @SomeUser`
    ]
  };

  public async action(message: Message, args: string[]) {
    const result = args[0].toLowerCase();

    if (result !== OutcomeArgumentValue.Win && result !== OutcomeArgumentValue.Loss) {
      message.channel.send(`First parameter should be ${OutcomeArgumentValue.Win} or ${OutcomeArgumentValue.Loss}`);
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

    const winner = result === OutcomeArgumentValue.Win ? author : opponent;
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

  /**
   * Calculates the ratings of two users after a match and updates those users' ratings in
   * the database. The specification order of users does not matter.
   * @param firstUser The snowflake of a user.
   * @param secondUser The snowflake of another user.
   * @param server  The snowflake of the server these users are recording their match for.
   * @param winner  The snowflake of the user who won, which should be either `firstUser` or `secondUser`.
   * @param dataService The data service to use to record the updated ratings.
   * @remarks The first/second distinction of the two users is done only for code readability.
   */
  private async updateRatings(firstUser: Snowflake, secondUser: Snowflake, server: Snowflake,
    winner: Snowflake, dataService: DataService) {

    const [authorRating, opponentRating] = await Promise.all([getRatingOrDefault(firstUser, server, dataService),
      getRatingOrDefault(secondUser, server, dataService)]);

    const { winnersNewRating: firstUsersNewRating,
      losersNewRating: secondUsersNewRating } = winner === firstUser
        ? this.getRatingsAfterMatch(authorRating, opponentRating)
        : this.getRatingsAfterMatch(opponentRating, authorRating);

    await Promise.all([dataService.setRating(firstUser, server, firstUsersNewRating),
      dataService.setRating(secondUser, server, secondUsersNewRating)]);
  }

  /**
   * Calculates what the winner's and loser's ratings would be after a match
   * between them.
   * @param winnersRating The rating of the user who won the match.
   * @param losersRating The rating of the user who lost the match.
   */
  private getRatingsAfterMatch(winnersRating: number, losersRating: number) {
    const eloResults = EloRating.calculate(winnersRating, losersRating, true);
    return {
      winnersNewRating: eloResults.playerRating,
      losersNewRating: eloResults.opponentRating
    };
  }

  /**
   * Records a match between two users.
   * @param firstUser The snowflake of a user.
   * @param secondUser The snowflake of another user.
   * @param server The snowflake of the server the match took place in.
   * @param date The date of the match.
   * @param winner The snowflake of the winner.
   * @param author The snowflake of the user who recorded the match.
   * @param dataService The data service instance to use to record the match.
   */
  private async recordMatch(firstUser: Snowflake, secondUser: Snowflake, server: Snowflake, date: Date,
    winner: Snowflake, author: Snowflake, dataService: DataService) {
    return dataService.addMatch(firstUser, secondUser, server, date, winner, author);
  }

}
