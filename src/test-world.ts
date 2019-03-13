import mysql from 'mysql';
import { MySqlDataService } from './data/sql/mysql-implementation/mysql-data-service';
import { SnowflakeUtil } from 'discord.js';

const pool = mysql.createPool({
  connectionLimit: 10,
  connectTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  host: 'hybot-test.cbce7r2dyrtw.us-east-1.rds.amazonaws.com',
  port: 3306,
  database: 'hybottest',
  user: 'testroot',
  password: 'supertesterdude'
});

MySqlDataService.createService(pool, 'testusers', 'testmatches', true).then((dataService: MySqlDataService) => {
  const user1 = SnowflakeUtil.generate();
  const user2 = SnowflakeUtil.generate();
  const server = SnowflakeUtil.generate();
  const date = new Date();
  const author = user1;
  const winner = user2;

  dataService.addMatch(user1,user2,server,date,winner,author);
  // dataService.deleteAllData();
});
