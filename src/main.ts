import http from 'http';
import { MySqlDataService } from './data/sql/mysql-data-service';
import { HyBot } from './hybot';
import { HyBotMySqlConfig } from './config/hybot-mysql-config';
import mysql from 'mysql';
import { HyBotConfig } from './config/hybot-config';
import { DataService } from './data/data-service';
import { GetRating, GetTop, Ping, Record, Roll, Timer } from './command/commands';
import { Help } from './command/commands/help';

const config: HyBotMySqlConfig = require('../config.json');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'hybot.cbce7r2dyrtw.us-east-1.rds.amazonaws.com',
  port: 3306,
  database: 'hybot',
  user: 'root',
  password: 'superasbestosman34'
});

MySqlDataService.createService(pool, config.sql.userTableName, config.sql.matchTableName, true)
  .then(async service => {
    await startBot(config, service);
  }).catch(err => {
    console.log('Error creating sql data service:');
    console.log(err);
  });

// prevent heroku shelving our app
setInterval(() => {
  http.get('http://hy-bot-hero-sql.herokuapp.com');
}, 900000);

async function startBot(config: HyBotConfig, dataService: DataService) {
  const bot = new HyBot(config);
  bot.commandRegistry.registerCommand(new GetRating(config.prefix, dataService));
  bot.commandRegistry.registerCommand(new Help(bot.commandRegistry));
  bot.commandRegistry.registerCommand(new Ping());
  bot.commandRegistry.registerCommand(new Record(config.prefix, dataService));
  bot.commandRegistry.registerCommand(new Roll(config.prefix));
  bot.commandRegistry.registerCommand(new Timer(config.prefix));

  const client = await bot.connect();
  console.log(`Bot Client logged in as ${client.user.username}.`);

  bot.commandRegistry.registerCommand(new GetTop(dataService, client));
}
