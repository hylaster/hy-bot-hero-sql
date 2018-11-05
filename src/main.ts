import http from 'http';
import { MySqlPoolLocator } from './data/sql/mysql-pool-locator';
import { MySqlDataService } from './data/mysql-data-service';
import { HyBot, ConnectResponse } from './hybot';
import { HyBotMySqlConfig } from './config/hybot-mysql-config';

const config: HyBotMySqlConfig = require('../config.json');

const pool = MySqlPoolLocator.getPool();
const dataService = new MySqlDataService(pool, config.sql.userTableName, config.sql.matchTableName);
const bot = new HyBot(config, dataService);
bot.connect().then((resp: ConnectResponse) => {
  console.log(`Bot Client logged in as ${resp.botUsername}.`);
}).catch(console.error);

// prevent heroku shelving our app
setInterval(() => {
  http.get('http://hy-bot-hero-sql.herokuapp.com');
}, 900000);
