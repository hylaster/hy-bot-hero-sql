import { DataService, UserRatingPair, TopTwo } from './dataservice';
import { Pool, MysqlError } from 'mysql';
import { Snowflake, Guild } from 'discord.js';
import readline from 'readline';

const getSqlDateString = (date: Date) =>
  `'${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}'`;

const sqlOutcomeRepresentation = new Map<boolean, string>([[true, 'winvs'], [false, 'lossvs']]);

export class MySqlDataService implements DataService {

  constructor(private pool: Pool) { }

  isUserRated(userId: Snowflake, server: Snowflake): Promise<boolean> {
    const query = 'SELECT rating FROM user_by_server WHERE userid = ? AND server = ?';
    const params = [userId, server];
    return new Promise<boolean>((resolve, reject) =>
      this.pool.query(query, params, (err, results) => {
        if (err) reject(err);
        resolve(results[0] != null);
      })
    );
  }

  initializeUserRating(userId: Snowflake, server: Snowflake, rating: number): Promise<void> {
    const query = 'INSERT INTO user_by_server VALUES (?, ?, ?)';
    const params = [userId, server, rating];
    return new Promise<void>((resolve, reject) =>
      this.pool.query(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }));
  }

  getRating(userId: Snowflake, server: Snowflake): Promise<number> {
    return new Promise<number>((resolve, reject) =>
      this.pool.query('SELECT rating FROM user_by_server WHERE userid = ? AND server = ?', [userId, server], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].rating);
        }
      }));
  }

  getTopTwoPlayers(server: Snowflake): Promise<TopTwo> {
    const query = 'SELECT userid, rating FROM user_by_server WHERE server = ? ORDER BY rating DESC LIMIT 2;';
    const params = [server];

    return new Promise<{ RankOne: UserRatingPair, RankTwo: UserRatingPair }>((resolve, reject) =>
      this.pool.query(query, params, (err: MysqlError | null, results: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            RankOne: { userId: results[0].userid, rating: results[0].rating },
            RankTwo: { userId: results[1].userid, rating: results[1].rating }
          });
        }
      }));
  }

  areUsersEligibleForMatch(user1: Snowflake, user2: Snowflake, server: Snowflake, date: Date): Promise<boolean> {
    const isUserEligible = (user1: Snowflake, user2: Snowflake) => {
      const query = 'SELECT * FROM match_by_server WHERE user1 = ? AND user2 = ? AND record_date = ? AND server = ?';
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
    const query = 'UPDATE user_by_server SET rating = ? WHERE userid = ? AND server = ?';
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
    const query = 'INSERT INTO match_by_server VALUES (?, ?, ?, ?, ?)';
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

  deleteAllDataForServer(server: Guild) {
    const snowflake = server.id;

    const io = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    io.question(`Really delete ALL data for server ${server.name}? (y/n)`, resp => {
      if (resp.toLowerCase() === 'y') {
        console.log(`Deleting all data for server ${snowflake}`);
        const deleteAll = Promise.all([this.deleteAllMatchesForServer(snowflake), this.deleteAllUsersForServer(snowflake)]);
        deleteAll.then(() => {
          console.log('Data deleted successfully.');
        }).catch(console.error);
      }
    });
  }

  private deleteAllMatchesForServer(server: Snowflake): Promise<void> {
    const query = 'DELETE FROM match_by_server WHERE server = ?';
    const params = [server];

    return new Promise<void>((resolve, reject) =>
      this.pool.query(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`Deleted all matches for ${server}.`);
          resolve();
        }
      }));
  }

  private deleteAllUsersForServer(server: Snowflake): Promise<void> {
    const query = 'DELETE FROM user_by_server WHERE server = ?';
    const params = [server];

    return new Promise<void>((resolve, reject) =>
      this.pool.query(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`Deleted all matches for ${server}.`);
          resolve();
        }
      }));
  }
}
