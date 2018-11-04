const config = require('../config.json');
import http from 'http';
import { MySqlPoolLocator } from './data/sql/mysql-pool-locator';
import { MySqlDataService } from './data/mysql-data-service';
import { HyBot } from './hybot';

const pool = MySqlPoolLocator.getPool();
const dataService = new MySqlDataService(pool);
const bot = new HyBot(config, dataService);
bot.connect();

// prevent heroku shelving our app
setInterval(() => {
  http.get('http://hy-bot-hero-sql.herokuapp.com');
}, 900000);
