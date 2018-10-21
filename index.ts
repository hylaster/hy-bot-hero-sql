import Discord from 'discord.js';
const config = require('./config.json');
import http from 'http';
import MySqlPoolLocator from './sql/mysql-pool-locator';
import { MySqlDataService } from './data/mysql-data-service';
import { Command } from './commands/command';

const pool = MySqlPoolLocator.getPool();
const dataService = new MySqlDataService(pool);
const client = new Discord.Client();

client.on('ready', () => {
  console.log('Ready.');
});

client.on('message', handleMessage);

client.login(config.token);

// prevent heroku shelving our app
setInterval(() => {
  http.get('https://hy-bot-hero-sql.herokuapp.com');
}, 900000);

function handleMessage(message: Discord.Message) {

  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const words: string[] = message.content.slice(config.prefix.length).trim().split(/ +/g);

  if (words == null || words.length === 0) return;

  const commandName = words[0] == null ? null : words[0].toLowerCase();
  const args = words.splice(1);

  if (commandName == null) return;
  if (commandName.charAt(0) === '.') {
    message.channel.send('Potential attempt to access outside of commands. Ignoring command.');
  } else {
    const command: Command = require(`./commands/${commandName}.js`);
    if (command != null) {
      command(client, message, args, dataService);
    }
  }
}
