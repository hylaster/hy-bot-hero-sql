import http from 'http';
import { HyBot } from '../src/hybot';
import { EloDataService } from '../src/data/elo-data-service';
import { GetRating, GetTop, Ping, Record, Roll, Timer } from '../src/command/commands';
import { Help } from '../src/command/commands/help';
import { config } from './hy-bot-config';
import { HyBotConfig } from '../src/config/hybot-config';
import { SqliteEloDataService } from '../src/data/sql/sqlite-implementation/sqlite-data-service';

// Spins up an implementation of Hybot.

function start() {
  const dataService = SqliteEloDataService.createInMemoryService();
  startBot(config, dataService);
}

async function startBot(config: HyBotConfig, dataService: EloDataService) {
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
