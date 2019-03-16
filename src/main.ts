import http from 'http';
import { MySqlDataService } from './data/sql/mysql-implementation/mysql-data-service';
import { HyBot } from './hybot';
import { HyBotMySqlConfig } from './config/hybot-mysql-config';
import mysql from 'mysql';
import { HyBotConfig } from './config/hybot-config';
import { DataService } from './data/data-service';
import { GetRating, GetTop, Ping, Record, Roll, Timer } from './command/commands';
import { Help } from './command/commands/help';
const read = require('read');

// Spins up an implementation of Hybot.

const config: HyBotMySqlConfig = require('../config.json');

async function start() {
  const { user, password } = getCredentials();

  if (user == null || password == null) {
    throw Error('Database user and/or password environment variables are missing.');
  }

  const pool = mysql.createPool({
    connectionLimit: 10,
    connectTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    host: 'hybot.cbce7r2dyrtw.us-east-1.rds.amazonaws.com',
    port: 3306,
    database: 'hybot',
    user,
    password
  });

  const dataService = await MySqlDataService.createService(pool, config.sql.userTableName, config.sql.matchTableName, true);
  startBot(config, dataService);
}

function getCredentials(): { user?: string, password?: string } {
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;

  return { user, password };
}

async function startBot(config: HyBotConfig, dataService: DataService) {
  const bot = new HyBot(config);
  bot.commandRegistry.registerCommand(new GetRating(config.prefix, dataService));
  bot.commandRegistry.registerCommand(new Help(config.prefix, bot.commandRegistry, []));
  bot.commandRegistry.registerCommand(new Ping());
  bot.commandRegistry.registerCommand(new Record(config.prefix, dataService));
  bot.commandRegistry.registerCommand(new Roll(config.prefix));
  bot.commandRegistry.registerCommand(new Timer(config.prefix));

  const client = await bot.connect();
  console.log(`Bot Client logged in as ${client.user.username}.`);

  bot.commandRegistry.registerCommand(new GetTop(config.prefix, dataService, client));
}

start();

// Prevent Heroku shelving our app.
setInterval(() => {
  http.get('http://hy-bot-hero-sql.herokuapp.com');
}, 900000);
