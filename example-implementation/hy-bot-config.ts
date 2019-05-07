import { HyBotMySqlConfig } from 'src/config/hybot-mysql-config';

const host = process.env.DATABASE_HOST;
const port = (process.env.DATABASE_PORT != null ? process.env.DATABASE_PORT : 3306) as number;
const database = process.env.DATABASE_DB_NAME;
const user = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;

[host, port, database, user, password].forEach((item) => {
  if (item == null) {
    throw Error('Database connection information is missing.');
  }
});

export const config: HyBotMySqlConfig = {
  token: 'NTAzNzU4NTM4NDE4NTUyODMy.DsAZgA.DU9XxTFbv_qAinykdbR_YIN9IHY',
  prefix: '!',
  owners: ['368485403340046336'],
  clientConfig: {},
  sql: {
    'connectionInfo': {
      host: host!,
      port: port!,
      database: database!,
      user: user!,
      password: password!
    },
    'userTableName': 'user_by_server_test',
    'matchTableName': 'match_by_server_test'
  }
};
