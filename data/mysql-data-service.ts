import { DataService, UserRatingPair } from './dataservice';
import { Pool, MysqlError } from 'mysql';
import { Snowflake } from 'discord.js';

const getSqlDateString = (date: Date) =>
  `'${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}'`;

const sqlOutcomeRepresentation = new Map<boolean, string>([[true, 'winvs'], [false, 'lossvs']]);

export const enum Outcome {
  Win = 'winvs',
  Loss = 'lossvs'
}

export class MySqlDataService implements DataService {

  constructor(private pool: Pool) { }

  isUserRated(userId: Snowflake, server: Snowflake): Promise<boolean> {
    const query = 'SELECT rating FROM UserByServer WHERE userid = ? AND server = ?';
    const params = [userId, server];
    return new Promise<boolean>((resolve, reject) =>
      this.pool.query(query, params, (err, results) => {
        if (err) reject(err);
        resolve(results[0] != null);
      })
    );
  }

  initializeUserRating(userId: Snowflake, server: Snowflake, rating: number): Promise<void> {
    const query = 'INSERT INTO UserByServer VALUES (?, ?, ?)';
    const params = [userId, server, rating];
    return new Promise<void>((resolve, reject) =>
      this.pool.query(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          console.log('Added user ' + userId);
          message.channel.send(`${user}'s rating initialised to 1000`);
          resolve();
        }
      }));
  }

  getRating(userId: Snowflake, server: Snowflake): Promise<number> {
    return new Promise<number>((resolve, reject) =>
      this.pool.query('SELECT rating FROM UserByServer WHERE userid = ? AND server = ?', [userId, server], (err, results) => {
        if (err) {
          reject(err);
        } else if (!results[0]) {
          this.pool.query('INSERT INTO UserByServer VALUES (?, ?, 1000)', [userId, server], function (err) {
            if (err) {
              reject(err);
            } else {
              console.log('Added user ' + userId);
              message.channel.send(`${user}'s rating initialised to 1000`);
              resolve(1000);
            }
          });
        } else {
          resolve(results[0].rating);
        }
      }));
  }

  getTopTwoPlayers(server: Snowflake): Promise<{ RankOne: UserRatingPair, RankTwo: UserRatingPair }> {
    const query = 'SELECT userid, rating FROM UserByServer WHERE server = ? ORDER BY rating DESC LIMIT 2;';
    const params = [server];

    return new Promise<{ RankOne: UserRatingPair, RankTwo: UserRatingPair }>((resolve, reject) =>
      this.pool.query(query, params, (err: MysqlError | null, results: any[]) => {
        if (err) {
          console.log(err);
        } else {
          if (!results[1]) {
            message.channel.send(`Two users do not exist.`);
            console.log('Two users do not exist.');
          } else {
            console.log('Successfully found top two players.');
            message.channel.send(`Top rating is ${client.users.get(results[0].userid)} at ${results[0].rating}
                2nd place is ${client.users.get(results[1].userid)} at ${results[1].rating}`);
          }
        }
      });
  }

  areUsersEligibleForMatch(user1: Snowflake, user2: Snowflake, server: Snowflake, date: Date): Promise<boolean> {
    const isUserEligible = (user1: Snowflake, user2: Snowflake) => {
      const query = 'SELECT * FROM MatchByServer WHERE user1 = ? AND user2 = ? AND matchdate = ? AND server = ?';
      const params = [user1, user2, getSqlDateString(date), server];

      return new Promise<boolean>((resolve, reject) =>
        this.pool.query(query, params, (err, results) => {
          if (err) reject(err);
          resolve(!results[0]);
        }));
    };

    return new Promise<boolean>((resolve) => {
      Promise.all([isUserEligible(user1, user2), isUserEligible(user2, user1)]).then(([result1, result2]) => {
        resolve(result1 && result2);
      });
    });
  }

  updateRating(userId: Snowflake, rating: number, server: Snowflake): Promise<number> {
    const query = 'UPDATE UserByServer SET rating = ? WHERE userid = ? AND server = ?';
    const params = [rating, userId, server];

    return new Promise<number>((resolve, reject) =>
      this.pool.query(query, params, function (err, results) {
        if (err) {
          reject(err);
        } else {
          console.log('Updated rating');
          resolve(results);
        }
      }));
  }

  addMatch(author: Snowflake, opponent: Snowflake, server: Snowflake, date: Date, authorWon: boolean): Promise<boolean> {
    const query = 'INSERT INTO MatchByServer VALUES (?, ?, ?, ?, ?)';
    const params = [author, opponent, getSqlDateString(date), server, sqlOutcomeRepresentation.get(authorWon)];

    return new Promise<boolean>((resolve, reject) =>
      this.pool.query(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          console.log('match results recorded');
          resolve(true);
        }
      }));
  }
}
