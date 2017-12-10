const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const enmap = require("enmap");
const enmapLevel = require("enmap-level");

const tableSource = new enmapLevel({name: "Records"});
client.records = new enmap({provider:tableSource});

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