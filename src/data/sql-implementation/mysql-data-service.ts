import { DataService, UserRatingPair } from '../data-service';
import { Pool, MysqlError } from 'mysql';
import { Snowflake, Guild } from 'discord.js';
import readline from 'readline';
import { tablesExist, createUserTable, createMatchTable } from './table-management';
import dedent = require('dedent');

const getSqlDateString = (date: Date) =>
  `'${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}'`;

export class MySqlDataService implements DataService {

  private constructor(private pool: Pool, private userTableName: string, private matchTableName: string) { }

  static async createService(pool: Pool, userTableName: string, matchTableName: string,
    createMissingTables: boolean = false): Promise<MySqlDataService> {

    const tableNames: string[] = [userTableName, matchTableName];
    const doesTableExist: boolean[] = await tablesExist(pool, tableNames);

    const tableCreators: Promise<void>[] = [];

    const missingTables = doesTableExist.map((tableExists, index) => {
      return tableExists ? null : tableNames[index];
    }).filter(value => value != null);

    if (missingTables.length > 0) {
      if (createMissingTables) {
        if (missingTables.includes(userTableName)) tableCreators.push(createUserTable(pool, userTableName));
        if (missingTables.includes(matchTableName)) tableCreators.push(createMatchTable(pool, matchTableName));
      } else {
        throw new Error(dedent`There are missing tables: ${missingTables}.
                               Use the built-in functions to create the tables, or set the createMissingTables parameter.`);
      }
    }

    await Promise.all(tableCreators);

    return new MySqlDataService(pool, userTableName, matchTableName);
  }

  isUserRated(user: Snowflake, server: Snowflake): Promise<boolean> {
    const query = 'SELECT rating FROM ?? WHERE user = ? AND server = ?';
    const params = [this.userTableName, user, server];
    return new Promise<boolean>((resolve, reject) =>
      this.pool.query(query, params, (err, results) => {
        if (err) reject(err);
        resolve(results[0] != null);
      })
    );
  }

  initializeUserRating(user: Snowflake, server: Snowflake, rating: number): Promise<void> {
    const query = 'INSERT INTO ?? VALUES (?, ?, ?)';
    const params = [this.userTableName, user, server, rating];
    return new Promise<void>((resolve, reject) =>
      this.pool.query(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }));
  }

  getRating(user: Snowflake, server: Snowflake): Promise<number | undefined> {
    const query = 'SELECT rating FROM ?? WHERE user = ? AND server = ?';
    const params = [this.userTableName, user, server];

    return new Promise<number>((resolve, reject) =>
      this.pool.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          const result: number | undefined = results[0];
          resolve(result != null ? results[0].rating : undefined);
        }
      }));
  }

  getTopNPlayers(server: Snowflake, n: number): Promise<UserRatingPair[]> {
    const query = 'SELECT user, rating FROM ?? WHERE server = ? ORDER BY rating DESC LIMIT ??';
    const params = [this.userTableName, server, n];

    return new Promise((resolve, reject) =>
      this.pool.query(query, params, (err: MysqlError | null, results: any[]) => {
        if (err) {
          reject(err);
        } else {
          const topUsers: UserRatingPair[] = results.map(result => ({ user: result.user, rating: result.rating }));

          resolve(topUsers);
        }
      }));
  }

  areUsersEligibleForMatch(user: Snowflake, otherUser: Snowflake, server: Snowflake, date: Date): Promise<boolean> {

    const [user1, user2] = this.getUsersAsOrderedPair(user,otherUser);

    const isUserEligible = (user1: Snowflake, user2: Snowflake) => {
      const query = 'SELECT * FROM ?? WHERE user1 = ? AND user2 = ? AND record_date = ? AND server = ?';
      const params = [this.matchTableName, user1, user2, getSqlDateString(date), server];

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

  setRating(user: Snowflake, rating: number, server: Snowflake): Promise<void> {
    const query = 'UPDATE ?? SET rating = ? WHERE user = ? AND server = ?';
    const params = [this.userTableName, rating, user, server];

    return new Promise<void>((resolve, reject) =>
      this.pool.query(query, params, function (err, _results) {
        if (err) {
          reject(err);
        } else {
          console.log('Updated rating');
          resolve();
        }
      }));
  }

  addMatch(user: Snowflake, otherUser: Snowflake, server: Snowflake, date: Date, winner: Snowflake, author: Snowflake): Promise<void> {

    const [user1, user2] = this.getUsersAsOrderedPair(user, otherUser);

    const query = 'INSERT INTO ?? VALUES (?, ?, ?, ?, ?, ?)';
    const params = [this.matchTableName, user1, user2, server, getSqlDateString(date), winner, author];

    return new Promise((resolve, reject) =>
      this.pool.query(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          console.log('match results recorded');
          resolve();
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
    const query = 'DELETE FROM ?? WHERE server = ?';
    const params = [this.matchTableName, server];

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
    const query = 'DELETE FROM ?? WHERE server = ?';
    const params = [this.userTableName, server];

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

  private getUsersAsOrderedPair(user: Snowflake, otherUser: Snowflake): [Snowflake, Snowflake] {
    return user < otherUser ? [user, otherUser] : [otherUser, user];
  }
}

// TODO: add GetOrDefault to data service, consider removing any unused methods.
