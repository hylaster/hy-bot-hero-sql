import { DataServiceTester } from './data-service';

import mysql from 'mysql';
import { MySqlDataService } from '../../src/data/sql/mysql-implementation/mysql-data-service';

describe(nameof(MySqlDataService), () => {

  let service: MySqlDataService;

  beforeAll(async () => {
    const pool = mysql.createPool({
      connectionLimit: 10,
      connectTimeout: 60 * 60 * 1000,
      timeout: 60 * 60 * 1000,
      host: 'hybot-test.cbce7r2dyrtw.us-east-1.rds.amazonaws.com',
      port: 3306,
      database: 'hybottest',
      user: 'testroot',
      password: 'supertesterdude',
      timezone: 'UTC+0'
    });

    service = await MySqlDataService.createService(pool, 'testusers', 'testmatches', true);
  });

  const tester = new DataServiceTester(
    () => service,
    (ds: MySqlDataService) => {
      ds.deleteAllData();
    });
  tester.execute();

});
