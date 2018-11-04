// TODO: properly isolate and test each part of the app

import Discord from 'discord.js';
const config = require('../config.json');
import { MySqlPoolLocator } from '../src/data/sql/mysql-pool-locator';
import { MySqlDataService } from '../src/data/mysql-data-service';

const pool = MySqlPoolLocator.getPool();
const dataService = new MySqlDataService(pool);
const client = new Discord.Client();

client.on('ready', () => {
  console.log('Ready.');
});

client.on('message', handleMessage);

client.login(config.token);

test('Bot works', () => {
  
});
