import Discord from "discord.js";
import Command from "./command";
const EloRating = require("elo-rating");

const getSqlDateString = (date: Date) => "'" + date.getUTCFullYear() + "-" + date.getUTCMonth() + "-" + date.getUTCDate() + "'";

const enum Outcome {
    Win = "winvs",
    Loss = "lossvs",
}

const comm: Command = (client, message, args, pool) => {
    function isEligible(user1: Discord.User, user2: Discord.User, date: Date): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => 
            pool.query("SELECT * FROM MatchByServer WHERE user1 = ? AND user2 = ? AND matchdate = ? AND server = ?",
            [user1.id, user2.id, getSqlDateString(date), message.guild.id], function (err, results) {
            if (err) reject(err);
            
                console.log(results);
                console.log(message.guild.id);
                resolve(!results[0]);
        }));
    }

    async function getRating(user: Discord.User, server: string): Promise<number> {
        return new Promise<number>((resolve, reject) => 
            pool.query("SELECT rating FROM UserByServer WHERE userid = ? AND server = ?", [user.id, server], function (err, results) {
            if (err) {
                reject(err);
            }
            else if (!results[0]) {
                pool.query("INSERT INTO UserByServer VALUES (?, ?, 1000)", [user.id, server], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log("Added user " + user.id);
                        message.channel.send(`${user}'s rating initialised to 1000`);
                        resolve(1000);
                    }
                });
            } else {
                resolve(results[0].rating);
            }
        }));;
    }

    async function updateRating(user: Discord.User, rating: number, server: string) {
        pool.query("UPDATE UserByServer SET rating = ? WHERE userid = ? AND server = ?", [rating, user.id, server], function (err, results) {
            if (err) {
                throw err;
            } else {
                console.log("Updated rating");
                return results;
            }
        });
    }

    async function addMatch(author: Discord.User, opponent: Discord.User, date: Date, result: Outcome, server: string) {
        pool.query("INSERT INTO MatchByServer VALUES (?, ?, ?, ?, ?)", [author.id, opponent.id, getSqlDateString(date), server, result], function (err) {
            if (err) {
                throw err;
            } else {
                console.log("match results recorded");
                return
            }
        });
    }

    const result = args[0].toLowerCase()];

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
        message.channel.send("Sorry, but playing with yourself is against the rules.");
        return;
    } else if (opponent.bot) {
        message.channel.send("Bots wouldn't mind battling you, but you would lose in six turns, which is a bit too quick for our tastes.");
        return;
    }

    // 1. find if match is eligible
    // 2. if so, get both ratings
    // 3. then, update the ratings
    Promise.all([isEligible(author, opponent, today), isEligible(opponent, author, today)])
        .then(([authorEligible, opponentEligible]) => {
            return authorEligible && opponentEligible;
        }).then((bothEligible) => {
            if (bothEligible) {
                Promise.all([getRating(author, message.guild.id), getRating(opponent, message.guild.id)])
                    .then(([authorRating, opponentRating]) => {
                        console.log("Ratings obtained.");

                        let newAuthorRating: number, newOpponentRating: number;
                        ({newAuthorRating, newOpponentRating} = getRatingsAfterGame(result, authorRating, opponentRating));

                        addMatch(author, opponent, today, result, message.guild.id).then(_ => {
                                console.log("match added");
                            Promise.all([updateRating(author, newAuthorRating, message.guild.id), updateRating(opponent, newOpponentRating, message.guild.id)])
                                .then(_ => message.channel.send(`Recording ${message.author.username}'s ${result} ${opponent}`));
                            }
                        );

                    });
            } else {
                message.channel.send("You two can have fun with each other, but can only record one match with each other per day.");
            }
        }).catch((error) => console.log(error));
}

function getRatingsAfterGame(result: Outcome, authorRating: number, opponentRating: number) {
    
    const eloResults = EloRating.calculate(authorRating, opponentRating, result === Outcome.Win);
    let difference = Math.abs(authorRating - eloResults.playerRating);
    console.log("difference is " + difference);
    difference *= 2;

    const newAuthorRating = authorRating + (result === Outcome.Win ? difference: -difference);
    const newOpponentRating = authorRating + (result === Outcome.Loss ? difference : -difference);

    return {newAuthorRating, newOpponentRating};
}

export default comm;