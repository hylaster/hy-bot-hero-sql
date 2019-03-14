import { DataService, DatedMatchOutcome, UserRatingPair } from '../../data-service';
import Sqlite, { Database } from 'better-sqlite3';
import dedent = require('dedent');
import { getUsersAsOrderedPair } from '../../../common';

const sanitizeTableName = (name: string) => name.replace(/[^A-Za-z0-9_]/g, '');

export class SqliteDataService implements DataService {

  private db: Database;

  private userTableName: string;
  private matchTableName: string;

  private constructor(filePath: string = '', userTableName: string, matchTableName: string, inMemory: boolean) {
    userTableName = sanitizeTableName(userTableName);
    matchTableName = sanitizeTableName(matchTableName);

    this.userTableName = userTableName;
    this.matchTableName = matchTableName;

    this.db = Sqlite(filePath, { memory: inMemory });

    if (!this.tableExists(userTableName)) this.createUserTable();
    if (!this.tableExists(matchTableName)) this.createMatchTable();
  }

  public static createPersistentService(filepath: string, userTableName: string, matchTableName: string): SqliteDataService {
    return new SqliteDataService(filepath, userTableName, matchTableName, false);
  }

  public static createInMemoryService(userTableName: string, matchTableName: string): SqliteDataService {
    return new SqliteDataService(undefined, userTableName, matchTableName, true);
  }

  public close() {
    this.db.close();
  }

  public isUserRated(user: string, server: string): Promise<boolean> {
    const query = `SELECT * FROM ${this.userTableName} WHERE user = ? AND server = ?`;

    const statement = this.db.prepare(query);
    const result = statement.get(user, server);

    return Promise.resolve(result != null);
  }

  public getRating(user: string, server: string): Promise<number | undefined> {
    const query = `SELECT * FROM ${this.userTableName} WHERE user = ? AND server = ?`;

    const statement = this.db.prepare(query);
    const result = statement.get(user, server);

    return result == null ? Promise.resolve(undefined) : Promise.resolve(result.rating);
  }

  public setRating(user: string, server: string, rating: number): Promise<void> {
    const query = dedent`INSERT INTO ${this.userTableName}(user,server,rating) VALUES (?, ?, ?)`;

    const statement = this.db.prepare(query);
    statement.run(user, server, rating);

    return Promise.resolve();
  }

  public areUsersEligibleForMatch(user: string, otherUser: string, server: string, date: Date): Promise<boolean> {
    const [user1, user2] = getUsersAsOrderedPair(user, otherUser);

    const query = dedent`SELECT user1,user2,server,date FROM ${this.matchTableName}
                         WHERE user1 = ? AND user2 = ? AND server = ? AND
                         julianday(date)=julianDay(?)`;

    const statement = this.db.prepare(query);
    const result = statement.get(user1, user2, server, date.toISOString());

    return Promise.resolve(result == null);
  }

  public addMatch(user: string, otherUser: string, server: string, date: Date, winner: string, author: string): Promise<void> {
    const [user1, user2] = getUsersAsOrderedPair(user, otherUser);

    const query = `INSERT INTO ${this.matchTableName} (user1,user2,server,date,winner,author) VALUES (?,?,?,?,?,?)`;
    const statement = this.db.prepare(query);
    statement.run(user1, user2, server, date.toISOString(), winner, author);

    return Promise.resolve();
  }

  public getMatchHistory(user: string, otherUser: string, server: string): Promise<DatedMatchOutcome[]> {
    const [user1, user2] = getUsersAsOrderedPair(user, otherUser);

    const query = dedent`SELECT date, winner, author FROM ${this.matchTableName}
                         WHERE user1 = ? AND user2 = ? AND server = ?
                         ORDER BY date ASC`;
    const statement = this.db.prepare(query);
    const results = statement.all(user1, user2, server);

    return Promise.resolve(results.map((result: any) => {
      return {
        date: new Date(result.date),
        winner: result.winner,
        author: result.author
      };
    }));
  }

  public getTopNPlayers(server: string, n: number): Promise<UserRatingPair[]> {
    const query = `SELECT user, rating FROM ${this.userTableName} WHERE server = ? ORDER BY rating DESC LIMIT ?`;
    const statement = this.db.prepare(query);
    const results = statement.all(server, n);

    return Promise.resolve(results);
  }

  public deleteAllData() {
    const tables = [this.userTableName, this.matchTableName];

    tables.forEach((table: string) => {
      const query = `DELETE FROM ${table}`;
      const statement = this.db.prepare(query);
      statement.run();
    });
  }

  private tableExists(tableName: string) {
    tableName = sanitizeTableName(tableName);

    const query = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
    const resp = query.get(tableName);

    return resp != null;
  }

  private createUserTable() {
    const tableQuery =
      dedent`CREATE TABLE ${this.userTableName} (
            user varchar(64),
            server varchar(64),
            rating smallint,
            UNIQUE(user,server) ON CONFLICT REPLACE
            )`;

    const tableStatement = this.db.prepare(tableQuery);
    tableStatement.run();

    const indexQuery = dedent`CREATE INDEX ${this.userTableName}_user_server
                                                ON ${this.userTableName} (user, server)`;

    const indexStatement = this.db.prepare(indexQuery);
    indexStatement.run();
  }

  private createMatchTable() {
    const tableQuery = dedent`CREATE TABLE ${this.matchTableName} (
                        user1 varchar(64),
                        user2 varchar(64),
                        server varchar(64),
                        date text,
                        winner varchar(64),
                        author varchar(64)
                        )`;

    const tableStatement = this.db.prepare(tableQuery);
    tableStatement.run();

    const indexQuery = dedent`CREATE INDEX ${this.matchTableName}_users_server_date
                              ON ${this.matchTableName} (user1, user2, server, date)`;

    const indexStatement = this.db.prepare(indexQuery);
    indexStatement.run();
  }
}
