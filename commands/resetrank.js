const config = require("../config.json");

exports.run = (client, message, args) => {
    if (message.author.id != config.owner){
        message.channel.send("Only the bot owner may reset a player's ranking.");
        return;
    }
    let member = message.mentions.members.first().user;
    client.records.set(member.id, config.defaultrank);    
    message.channel.send(`${member}'s rating reset to default value`);
}