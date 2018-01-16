const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const express = require('express');
const app = express();
const mysql = require("mysql");

const port = process.env.PORT || 5000;

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'us-cdbr-iron-east-05.cleardb.net',
    user            : 'b2bd33981e831f',
    password        : '5ee7aa57',
    database        : 'heroku_73d18bb7c7b731d'
});

/*
pool.query("ALTER TABLE `MatchByServer` ADD CONSTRAINT `MatchByServer_fk2` FOREIGN KEY (`server`) REFERENCES `UserByServer`(`server`);", function(err, results){
        if (err) console.log(err);
        else console.log(results);
});
*/

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', (request, response) => {
    response.render('index');
});

app.listen(port, () => {
    console.log('our app is running on localhost:' + port);
});

client.on("ready", () => {
    console.log("I am ready!");

});

client.on("message", (message) => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    console.log(message.guild.id);
    
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    try {
        if (command.charAt(0)===".") {
            message.channel.send("Funky business detected.");
            let member = message.mentions.members.first().user;            
        } else {
            let commandFile = require(`./commands/${command}.js`);
            commandFile.run(client, message, args, pool);    
        }
    } catch (err) {
        console.error(err);
    }
});

client.login(config.token);

setInterval(() => {
    http.get('http://hy-bot-hero-sql.herokuapp.com');
  }, 900000);