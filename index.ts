import Discord from "discord.js";
const client = new Discord.Client();
const config = require("./config.json");
import express from "express";
import http from "http";

import Command from './commands/command';

const port = process.env.PORT || 5000;

import MySqlPoolLocator from "./sql/mysql-pool-locator";
const pool = MySqlPoolLocator.getPool();

/*
pool.query("ALTER TABLE `MatchByServer` ADD CONSTRAINT `MatchByServer_fk2` FOREIGN KEY (`server`) REFERENCES `UserByServer`(`server`);", function(err, results){
        if (err) console.log(err);
        else console.log(results);
});
*/

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', (_request, response) => {
    response.render('index');
});

app.listen(port, () => {
    console.log(`Listening on ${port}.`);
});

client.on("ready", () => {
    console.log("Ready.");
});


const handleMessage = (message: Discord.Message) => {

    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const words: string[] = message.content.slice(config.prefix.length).trim().split(/ +/g);

    if (words == null || words.length == 0) return;

    const commandName = words[0] == null ? null : words[0].toLowerCase();
    const args = words.splice(1);

    if (commandName == null) return;
    if (commandName.charAt(0) === ".") {
        message.channel.send("Potential attempt to access outside of commands. Ignoring command.");
    } else {
        const command: Command = require(`./commands/${commandName}.js`);
        if (command != null) {
            command(client, message, args, pool);
        }
    }
}

client.on("message", handleMessage);

client.login(config.token);

setInterval(() => {
    http.get('https://hy-bot-hero-sql.herokuapp.com');
}, 900000);