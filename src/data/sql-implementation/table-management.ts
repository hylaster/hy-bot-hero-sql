import dedent from 'dedent';
import { Pool } from 'mysql';

// Static functions for setting up tables used by the mysql implementation.

export function tableExists(pool: Pool, tableName: string): Promise<boolean> {
  const query =
    dedent`SELECT *
          FROM information_schema.tables
          WHERE table_name = ?`;

  return new Promise<boolean>((resolve, reject) => {
    pool.query(query, [tableName], (err, results: []) => {
      if (err) {
        reject(err);
      } else if (results == null || results.length === 0) {
        resolve(false);
      } else if (results.length > 0) {
        resolve(true);
      }
    });
  });
}

export async function tablesExist(pool: Pool, tableNames: string[]): Promise<boolean[]> {
  return Promise.all(tableNames.map(name => tableExists(pool, name)));
}

export function createUserTable(pool: Pool, tableName: string): Promise<void> {
  const createUserByServer =
    dedent`CREATE TABLE ?? (
          userid varchar(64),
          server varchar(64),
          rating smallint
         )`;

  return new Promise((resolve, reject) => {
    pool.query(createUserByServer, [tableName], (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Created user table.');
        resolve();
      }
    });
  });
}

export function createMatchTable(pool: Pool, tableName: string): Promise<void> {
  const createMatchByServer =
    dedent`CREATE TABLE ?? (
          author varchar(64),
          opponent varchar(64),
          record_date DATE,
          server varchar(64),
          authorWon bit(1)
         )`;

  return new Promise((resolve, reject) => {
    pool.query(createMatchByServer, [tableName], (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Created match table.');
        resolve();
      }
    });
  });
}
