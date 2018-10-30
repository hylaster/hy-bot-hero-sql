import MySqlPoolLocator from './mysql-pool-locator';
import dedent from 'dedent';

const pool = MySqlPoolLocator.getPool();

const createUserByServer =
  dedent`CREATE TABLE user_by_server(
          userid varchar(64),
          server varchar(64),
          rating smallint
         )`;

pool.query(createUserByServer, (err) => {
  if (err) throw err;
  console.log('Created user_by_server table.');
});

const createMatchByServer =
  dedent`CREATE TABLE match_by_server(
          author varchar(64),
          opponent varchar(64),
          record_date DATE,
          server varchar(64),
          authorWon bit(1)
         )`;

pool.query(createMatchByServer, (err) => {
  if (err) throw err;
  console.log('Created match_by_server table.');
});
