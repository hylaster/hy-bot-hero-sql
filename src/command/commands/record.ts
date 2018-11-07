import { Command } from '../command';
import EloRating from 'elo-rating';
import { Snowflake } from 'discord.js';
import { DataService } from 'src/data/dataservice';
import { getRatingOrDefault } from '../shared/getRatingOrDefault';

enum Outcome {
  Win = 'winvs',
  Loss = 'lossvs'
}

export const Record: Command = async (context) => {
  const { message, args, dataService } = context;

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

  const authorWon = result === Outcome.Win;
  const today = new Date();
  const server = message.guild.id;

  const bothEligible = await dataService.areUsersEligibleForMatch(author.id, opponent.id, server, today);
  if (bothEligible) {
    await Promise.all([recordMatch(author.id, opponent.id, server, today, authorWon, dataService),
      updateRatings(author.id, opponent.id, server, authorWon, dataService)]);

    message.channel.send(`Recording ${message.author.username}'s ${result} ${opponent}`);
  } else {
    message.channel.send('You two can have fun with each other, but can only record one match with each other per day.');
  }
};

function getRatingsAfterMatch(authorWon: boolean, authorRating: number, opponentRating: number) {

  const eloResults = EloRating.calculate(authorRating, opponentRating, authorWon);
  let difference = Math.abs(authorRating - eloResults.playerRating);
  console.log('difference is ' + difference);
  difference *= 2;

  const newAuthorRating = authorRating + (authorWon ? difference : -difference);
  const newOpponentRating = authorRating + (!authorWon ? difference : -difference);

  return { newAuthorRating, newOpponentRating };
}

async function updateRatings(authorId: Snowflake, opponentId: Snowflake, server: Snowflake,
    authorWon: boolean, dataService: DataService) {
  const [authorRating, opponentRating] = await Promise.all([getRatingOrDefault(authorId, server, dataService),
    getRatingOrDefault(opponentId, server, dataService)]);
  const { newAuthorRating, newOpponentRating } = getRatingsAfterMatch(authorWon, authorRating, opponentRating);
  await Promise.all([dataService.setRating(authorId, newAuthorRating, server),
    dataService.setRating(opponentId, newOpponentRating, server)]);
}

async function recordMatch(authorId: Snowflake, opponentId: Snowflake, server: Snowflake, date: Date,
   authorWon: boolean, dataService: DataService) {
  return dataService.addMatch(authorId, opponentId, server, date, authorWon);
}
