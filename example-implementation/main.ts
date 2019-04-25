import http from 'http';
import { MySqlDataService } from '../src/data/sql/mysql-implementation/mysql-data-service';
import { HyBot } from '../src/hybot';
import mysql from 'mysql';
import { HyBotConfig } from '../src/config/hybot-config';
import { DataService } from '../src/data/data-service';
import { GetRating, GetTop, Ping, Record, Roll, Timer } from '../src/command/commands';
import { Help } from '../src/command/commands/help';

// Spins up an implementation of Hybot.

import { config } from './hy-bot-config';

async function start() {

  const { host, port, database, user, password } = config.sql.connectionInfo;

  const pool = mysql.createPool({
    connectionLimit: 10,
    connectTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    host,
    port,
    database,
    user,
    password
  });

  const dataService = await MySqlDataService.createService(pool, config.sql.userTableName, config.sql.matchTableName, true);
  startBot(config, dataService);
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
