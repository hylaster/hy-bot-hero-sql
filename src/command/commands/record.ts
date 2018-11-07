import { Command } from '../command';
import { initUserIfUnranked } from '../shared/initUserIfUnranked';
import EloRating from 'elo-rating';

enum Outcome {
  Win = 'winvs',
  Loss = 'lossvs'
}

export const Record: Command = async (context) => {
  const { message, args, dataService } = context;

  const result = args[0].toLowerCase();

  if (result !== Outcome.Win && result !== Outcome.Loss) {
    message.channel.send(`First argument should be ${Outcome.Win} or ${Outcome.Loss}`);
    return;
  }

  const opponent = message.mentions.members.first().user;
  const author = message.author;
  if (!opponent) return;

  const today = new Date();

  // ensure the two users are compatible
  if (opponent.id === message.author.id) {
    message.channel.send('Sorry, but playing with yourself is against the rules.');
    return;
  } else if (opponent.bot) {
    message.channel.send("Bots wouldn't mind battling you, but you would lose in six turns, which is a bit too quick for our tastes.");
    return;
  }

  const server = message.guild.id;

  const bothEligible = await dataService.areUsersEligibleForMatch(author.id, opponent.id, server, today);
  if (bothEligible) {
    await Promise.all([initUserIfUnranked(author, message, server, 1000, dataService),
      initUserIfUnranked(author, message, server, 1000, dataService)]);

    const [ authorRating, opponentRating ] = await Promise.all([dataService.getRating(author.id, server), dataService.getRating(opponent.id, server)]);
    const { newAuthorRating, newOpponentRating } = getRatingsAfterMatch(result, authorRating, opponentRating);

    const authorWon = result === Outcome.Win;
    await dataService.addMatch(author.id, opponent.id, server, today, authorWon);
    await Promise.all([dataService.updateRating(author.id, newAuthorRating, server),
      dataService.updateRating(opponent.id, newOpponentRating, server)]);

    message.channel.send(`Recording ${message.author.username}'s ${result} ${opponent}`);
  } else {
    message.channel.send('You two can have fun with each other, but can only record one match with each other per day.');
  }
};

function getRatingsAfterMatch(result: Outcome, authorRating: number, opponentRating: number) {

  const eloResults = EloRating.calculate(authorRating, opponentRating, result === Outcome.Win);
  let difference = Math.abs(authorRating - eloResults.playerRating);
  console.log('difference is ' + difference);
  difference *= 2;

  const newAuthorRating = authorRating + (result === Outcome.Win ? difference : -difference);
  const newOpponentRating = authorRating + (result === Outcome.Loss ? difference : -difference);

  return { newAuthorRating, newOpponentRating };
}
