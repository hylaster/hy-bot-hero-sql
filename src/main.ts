import http from 'http';
import { MySqlDataService } from './data/sql/mysql-data-service';
import { HyBot, ConnectResponse } from './hybot';
import { HyBotMySqlConfig } from './config/hybot-mysql-config';
import mysql from 'mysql';

const config: HyBotMySqlConfig = require('../config.json');

const pool = mysql.createPool({

  connectionLimit: 10,
  host: 'hybot.cbce7r2dyrtw.us-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'root',
  password: 'superasbestosman34'
});

MySqlDataService.createService(pool, config.sql.userTableName, config.sql.matchTableName, true).then(service => {
  const bot = new HyBot(config, service);
  bot.connect().then((resp: ConnectResponse) => {
    console.log(`Bot Client logged in as ${resp.botUsername}.`);
  }).catch(console.error);
}).catch(err => {
  console.log('Error creating sql data service:');
  console.log(err);
});

// prevent heroku shelving our app
setInterval(() => {
  http.get('http://hy-bot-hero-sql.herokuapp.com');
}, 900000);
