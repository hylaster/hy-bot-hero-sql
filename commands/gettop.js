exports.run = (client, message, args, pool) => {
    console.log("--");

    pool.query("SELECT userid, rating FROM UserByServer ORDER BY rating DESC WHERE server = " + message.guild.id + " LIMIT 2;", function(err, results){
        if (err) console.log(err);
        else {
            if (!results[1]){
                console.log("Two users do not exist.");
            } else {
                console.log("Successfully found top two players.");
                message.channel.send(`Top rating is ${client.users.get(results[0].userid)} at ${results[0].rating}
                2nd place is ${client.users.get(results[1].userid)} at ${results[1].rating}`);            
            }
        }
    });
}