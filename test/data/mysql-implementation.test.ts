import { DataServiceTester } from './data-service-tester';

import mysql from 'mysql';
import { MySqlEloDataService } from '../../src/data/sql/mysql-implementation/mysql-elo-data-service';

describe(nameof(MySqlEloDataService), () => {

  let service: MySqlEloDataService;
  let pool: mysql.Pool;
  beforeAll(async () => {

    console.log('USER', process.env['DATABASE_USER']);

    pool = mysql.createPool({
      connectionLimit: 10,
      connectTimeout: 60 * 60 * 1000,
      timeout: 60 * 60 * 1000,
      host: 'hybot.cbce7r2dyrtw.us-east-1.rds.amazonaws.com',
      port: 3306,
      database: 'hybot',
      user: 'root',
      password: 'bnG3y_towo',
      timezone: 'UTC+0'
    });

    service = await MySqlEloDataService.createService(pool, 'testusers', 'testmatches', true);
  });

  afterEach(async () => {
    await service.deleteAllData();
  })

  afterAll(() => {
    pool.end();
  });

  const tester = new DataServiceTester(() => service);

  tester.execute();
 

});
