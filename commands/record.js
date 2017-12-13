const config = require("../config.json");
const EloRating = require("elo-rating");

exports.run = (client, message, args) => {
    let table = client.records;
    let result = args[0];
    result = result.toLowerCase();

    if (result !== "winvs" && result !== "lossvs"){
        message.channel.send("First argument should be 'winvs' or 'lossvs'.");
        return;
    }
    let member = message.mentions.members.first().user;
    let member2 = message.author;
    let today = new Date().getUTCDate().toString();
    
    // ensure the two users are compatible
    if (member.id === message.author.id) {
        message.channel.send("Sorry, but I can't let you play with yourself.");
        return;          
    } else if (member.bot) {
        message.channel.send("No bot would waste six turns battling you.");
        return;
    } else if (today === (client.records.get(member.id + " " + member2.id) || false)) {
        message.channel.send("You may only challenge each member once per day.");
        return;
    }
    
    // determine match eligibility

    // get the current ranking of both players
    let rating1 = Number(client.records.get(member.id)) || 1000;
    let rating2 = Number(client.records.get(member2.id)) || 1000;
    
    if (result === "winvs"){
        results = EloRating.calculate(rating1,rating2,false);
        let difference = Math.abs(rating1 - results.playerRating);
        console.log("difference is " + difference);
        difference *= 2;
        rating1 = rating1 - difference;
        rating2 = rating2 + difference;
    } else {
        results = EloRating.calculate(rating1, rating2, true);
        let difference = Math.abs(rating1 - results.playerRating);
        console.log("difference is " + difference);
        difference *= 2;
        rating1 = rating1 + difference;
        rating2 = rating2 - difference;
    }

    client.records.set(member.id, rating1);
    client.records.set(member2.id, rating2);
    client.records.set(member.id + " " + member2.id, today);
    client.records.set(member2.id + " " + member.id, today);

    message.channel.send(`Recording ${message.author.username}'s ${result} ${member}`);
}