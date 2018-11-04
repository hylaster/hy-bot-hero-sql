import http from 'http';
import { MySqlPoolLocator } from './data/sql/mysql-pool-locator';
import { MySqlDataService } from './data/mysql-data-service';
import { HyBot, ConnectResponse } from './hybot';
import { HyBotConfig } from './hybot-config';

const config: HyBotConfig = require('../config.json');

const pool = MySqlPoolLocator.getPool();
const dataService = new MySqlDataService(pool);
const bot = new HyBot(config, dataService);
bot.connect().then((resp: ConnectResponse) => {
  console.log(`Bot Client logged in as ${resp.botUsername}.`);
}).catch(console.error);

// prevent heroku shelving our app
setInterval(() => {
  http.get('http://hy-bot-hero-sql.herokuapp.com');
}, 900000);
