import { DataService, UserRatingPair, DatedMatchOutcome } from '../../data-service';
import { Pool, MysqlError } from 'mysql';
import { Snowflake } from 'discord.js';
import { tablesExist, createUserTable, createMatchTable } from './table-management';
import dedent = require('dedent');
import { getUsersAsOrderedPair } from '../../../common';

export class MySqlDataService implements DataService {

  private constructor(private pool: Pool, private userTableName: string, private matchTableName: string) { }

  static async createService(pool: Pool, userTableName: string, matchTableName: string,
    createMissingTables: boolean = false): Promise<MySqlDataService> {

    pool.config.timezone = 'UTC+0';

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

  public isUserRated(user: Snowflake, server: Snowflake): Promise<boolean> {
    const query = 'SELECT rating FROM ?? WHERE user = ? AND server = ?';
    const params = [this.userTableName, user, server];
    return new Promise<boolean>((resolve, reject) =>
      this.pool.query(query, params, (err, results) => {
        if (err) reject(err);
        resolve(results[0] != null);
      })
    );
  }

  public getRating(user: Snowflake, server: Snowflake): Promise<number | undefined> {
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

  public getTopNPlayers(server: Snowflake, n: number): Promise<UserRatingPair[]> {
    const query = 'SELECT user, rating FROM ?? WHERE server = ? ORDER BY rating DESC LIMIT ?';
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

  public areUsersEligibleForMatch(user: Snowflake, otherUser: Snowflake, server: Snowflake, date: Date): Promise<boolean> {

    const [user1, user2] = getUsersAsOrderedPair(user, otherUser);

    const isUserEligible = (user1: Snowflake, user2: Snowflake) => {
      const query = 'SELECT * FROM ?? WHERE user1 = ? AND user2 = ? AND DATEDIFF(record_date,?) = 0 AND server = ?';
      const params = [this.matchTableName, user1, user2, date.toISOString(), server];

      return new Promise<boolean>((resolve, reject) =>
        this.pool.query(query, params, (err, results) => {
          if (err) reject(err);
          resolve(results[0] == null);
        }));
    };

    return new Promise<boolean>((resolve) => {
      Promise.all([isUserEligible(user1, user2), isUserEligible(user2, user1)]).then(([result1, result2]) => {
        resolve(result1 && result2);
      });
    });
  }

  public setRating(user: Snowflake, server: Snowflake, rating: number): Promise<void> {
    const query = dedent`INSERT INTO ?? (user,server,rating) VALUES (?,?,?)
                         ON DUPLICATE KEY UPDATE rating=VALUES(rating)`;
    const params = [this.userTableName, user, server, rating];

    return new Promise<void>((resolve, reject) =>
      this.pool.query(query, params, function (err, _results) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }));
  }

  public addMatch(user: Snowflake, otherUser: Snowflake, server: Snowflake, date: Date, winner: Snowflake, author: Snowflake): Promise<void> {
    const [user1, user2] = getUsersAsOrderedPair(user, otherUser);

    const query = dedent`INSERT INTO ?? (user1,user2,server,record_date,winner,author)
                         VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [this.matchTableName, user1, user2, server, date.toISOString(), winner, author];

    return new Promise((resolve, reject) =>
      this.pool.query(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }));
  }

  public getMatchHistory(user: string, otherUser: string, server: string): Promise<DatedMatchOutcome[]> {

    const [user1, user2] = getUsersAsOrderedPair(user, otherUser);

    const query = dedent`SELECT * FROM ?? WHERE user1 = ? AND user2 = ? AND server = ?
                         ORDER BY record_date ASC `;
    const params = [this.matchTableName, user1, user2, server, server];

    return new Promise((resolve, reject) =>
      this.pool.query(query, params, function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results.map((result: any) => {
            const matchOutcome: DatedMatchOutcome = {
              date: new Date(result.record_date),
              winner: result.winner,
              author: result.author
            };

            return matchOutcome;
          }));
        }
      }));
  }

  public async deleteAllData(): Promise<void> {
    const tables = [this.userTableName, this.matchTableName];

    await Promise.all(tables.map((table: string) => {
      const query = `DELETE FROM ${table}`;
      return new Promise((resolve, reject) => {
        this.pool.query(query, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }));
  }

  public deleteAllMatchesForServer(server: Snowflake): Promise<void> {
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

  public deleteAllUsersForServer(server: Snowflake): Promise<void> {
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
}

// TODO: add GetOrDefault to data service, consider removing any unused methods.
