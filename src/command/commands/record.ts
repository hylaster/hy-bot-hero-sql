import Discord from 'discord.js';
import { Command } from '../command';
import { DataService } from '../../data/dataservice';
import { getOrInitRanking } from '../shared/getOrInitRanking';
const EloRating = require('elo-rating');

const enum Outcome {
  Win = 'winvs',
  Loss = 'lossvs'
}

export const Record: Command = (_client: Discord.Client, message: Discord.Message,
  args: string[], dataService: DataService) => {

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
  // 1. find if match is eligible
  // 2. if so, get both ratings
  // 3. then, update the ratings
  dataService.areUsersEligibleForMatch(author.id, opponent.id, server, today)
    .then((bothEligible) => {
      if (bothEligible) {
        Promise.all([getOrInitRanking(author, message, server, 1000, dataService), author, message, server, 1000, dataService]).then(_ => {
          Promise.all([dataService.getRating(author.id, server), dataService.getRating(opponent.id, server)]).then(([authorRating, opponentRating]) => {
            console.log('Ratings obtained.');

            let newAuthorRating: number;
            let newOpponentRating: number;
            ({ newAuthorRating, newOpponentRating } = getRatingsAfterGame(result, authorRating, opponentRating));

            const authorWon = result === Outcome.Win;
            dataService.addMatch(author.id, opponent.id, server, today, authorWon).then(_ => {
              console.log('match added');
              Promise.all([dataService.updateRating(author.id, newAuthorRating, server),
                dataService.updateRating(opponent.id, newOpponentRating, server)])
                .then(_ => message.channel.send(`Recording ${message.author.username}'s ${result} ${opponent}`));
            }
            );
          });
        });
      } else {
        message.channel.send('You two can have fun with each other, but can only record one match with each other per day.');
      }
    }).catch((error) => console.log(error));
};

function getRatingsAfterGame(result: Outcome, authorRating: number, opponentRating: number) {

  const eloResults = EloRating.calculate(authorRating, opponentRating, result === Outcome.Win);
  let difference = Math.abs(authorRating - eloResults.playerRating);
  console.log('difference is ' + difference);
  difference *= 2;

  const newAuthorRating = authorRating + (result === Outcome.Win ? difference : -difference);
  const newOpponentRating = authorRating + (result === Outcome.Loss ? difference : -difference);

  return { newAuthorRating, newOpponentRating };
}
