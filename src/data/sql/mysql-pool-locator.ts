import mysql from 'mysql';

export const MySqlPoolLocator = {
  getPool: function (): mysql.Pool {
    return mysql.createPool({
      connectionLimit: 10,
      host: 'hy-bot.cbce7r2dyrtw.us-east-1.rds.amazonaws.com',
      port: 3306,
      user: 'root',
      password: 'superasbestosman34'
    });
  }
};
