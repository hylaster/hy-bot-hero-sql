exports.run = (client, message, args, pool) => {
    let member = message.mentions.members.first().user;
    if (!member) return;
    
    let rating = client.records.get(member.id) || 1000;
    pool.query("SELECT userid, rating FROM UserByServer WHERE userid = " + member.id + " AND server = " + message.guild.id + ";", function(err, results){
        console.log(results.length);
        
        if (!results[0]){
            pool.query("INSERT INTO UserByServer VALUES ( " + member.id + ", " + message.guild.id + ", 1000);", function(err2){
                if (err2) console.log(err2);
                else {
                    console.log("Added user " + member.id);
                    message.channel.send(`${member}'s rating initalised to 1000`);
                }
            });
        } else {
            message.channel.send(`${member}'s rating is ${results[0].rating}`);
        }
    });
};