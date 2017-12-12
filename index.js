const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const enmap = require("enmap");
const enmapLevel = require("enmap-level");
const express = require('express');
const app = express();

const port = process.env.PORT || 5000;

const tableSource = new enmapLevel({name: "Records"});
client.records = new enmap({provider:tableSource});


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

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    try {
        if (command.charAt(0)===".") {
            message.channel.send("Funky business detected.");
            let member = message.mentions.members.first().user;            
        } else {
            let commandFile = require(`./commands/${command}.js`);
            commandFile.run(client, message, args);    
        }
    } catch (err) {
        console.error(err);
    }
});

client.login(config.token);

setInterval(() => {
    http.get('http://hy-bot-hero.herokuapp.com');
  }, 900000);