import Command from "./command";

const config = require("../config.json");

const comm: Command = (client, message, args, pool) => {
    if (message.author.id != config.owner){
        message.channel.send("Only the bot owner may reset a player's ranking.");
        return;
    }

    let member = message.mentions.members.first().user;
    if (!member){
        message.channel.send("Please tag a user.");
    } else {
        pool.query("UPDATE User2 SET rating = ? WHERE userid = ?", [1000, member.id],function(err, results){
            if (err) console.log(err);
            else {
                message.channel.send(`${member}'s rating reset to default value`);
            }
        });
    }
}

export default comm;