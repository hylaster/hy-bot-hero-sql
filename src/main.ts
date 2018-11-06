import http from 'http';
import { MySqlDataService } from './data/sql/mysql-data-service';
import { HyBot, ConnectResponse } from './hybot';
import { HyBotMySqlConfig } from './config/hybot-mysql-config';
import mysql from 'mysql';

const config: HyBotMySqlConfig = require('../config.json');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'hy-bot.cbce7r2dyrtw.us-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'root',
  password: 'superasbestosman34'
});

const dataService = new MySqlDataService(pool, config.sql.userTableName, config.sql.matchTableName);
const bot = new HyBot(config, dataService);
bot.connect().then((resp: ConnectResponse) => {
  console.log(`Bot Client logged in as ${resp.botUsername}.`);
}).catch(console.error);

// prevent heroku shelving our app
setInterval(() => {
  http.get('http://hy-bot-hero-sql.herokuapp.com');
}, 900000);
