// update this to use Q promises?
const config = require("../config.json");
const EloRating = require("elo-rating");

exports.run = (client, message, args, pool) => {
    function isEligible(user1, user2, currentDate, server, callback) {
        pool.query("SELECT * FROM MatchByServer WHERE user1 = " + user1.id + " AND user2 = " + user2.id + " AND matchdate = " + currentDate + " AND server = " + message.guild.id + ";", function (err, results) {
            if (err) callback(err, null);
            else {
                console.log(results);
                console.log(message.guild.id);
                if (!results[0]) {
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        });
    }

    function getRating(user, server, callback) {
        pool.query("SELECT rating FROM UserByServer WHERE userid = " + user.id + " AND server = " + server + ";", function (err, results) {
            if (err) console.log(err);
            else if (!results[0]) {
                pool.query("INSERT INTO UserByServer VALUES ( " + user.id + ", " + server + ", 1000);", function (err2) {
                    if (err2) callback(err, null);
                    else {
                        console.log("Added user " + user.id);
                        message.channel.send(`${user}'s rating initialised to 1000`);
                        callback(null, [{rating: 1000}]);
                    }
                });
            } else {
                callback(null, results);
            }
        });
    }

    function updateRating(user, rating, server, callback) {
        pool.query("UPDATE UserByServer SET rating = " + rating + " WHERE userid = " + user.id + " AND server = " + server + ";", function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                console.log("Updated rating");
                callback(null, results);
            }
        });
    }

    function addMatch(author, opponent, currentDate, result, server, callback) {
        pool.query("INSERT INTO MatchByServer VALUES ( " + author.id + ", " + opponent.id + ", " + currentDate + ", " + server + ", " + matchresult + ");", function (err) {
            if (err) {
                callback(err, null)
            } else {
                console.log("match results recorded");
                callback(null, err);
            }
        });
    }

    let table = client.records;
    let result = args[0];
    result = result.toLowerCase();

    if (result !== "winvs" && result !== "lossvs") {
        message.channel.send("First argument should be 'winvs' or 'lossvs'.");
        return;
    }
    let opponent = message.mentions.members.first().user;
    let author = message.author;
    if (!opponent) return;

    let today = new Date();
    let todayString = "'" + today.getUTCFullYear() + "-" + today.getUTCMonth() + "-" + today.getUTCDate() + "'";
    let eligibility1 = null;
    let eligibility2 = null;

    // ensure the two users are compatible
    if (opponent.id === message.author.id) {
        message.channel.send("Sorry, but playing with yourself is against the rules.");
        return;
    } else if (opponent.bot) {
        message.channel.send("Bots wouldn't mind battling you, but you would lose in six turns, which is a bit too quick for our tastes.");
        return;
    }

    // get the current ranking of both players
    let authorRating = 1000;
    let opponentRating = 1000;

    // 1. find if match is eligible
    // 2. if so, get both ratings
    // 3. then, update the ratings
    isEligible(author, opponent, todayString, message.guild.id, function (err, results) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("detected eligibility");
        if (results) {
            // first eligibility pass checked.
            // perform 2nd
            isEligible(opponent, author, todayString, message.guild.id, function (err, results2) {
                if (err) {
                    console.log(err);
                    return;
                }

                // eligible match. perform the other functions
                console.log("eligible match detected");
                if (results2){
                    getRating(author, message.guild.id, function (err, results3) {
                        if (err) console.log(err);
                        else if (results3) {
                            authorRating = results3[0].rating;
                            getRating(opponent, message.guild.id, function (err, results4) {
                                if (err) console.log(err);
                                else if (results4) {
                                    console.log("ratings obtained");
                                    opponentRating = results4[0].rating;
                                    let eloresults;
                                    matchresult = 0;
                                    if (result === "winvs") {
                                        eloresults = EloRating.calculate(authorRating, opponentRating, true);
                                        let difference = Math.abs(authorRating - eloresults.playerRating);
                                        console.log("difference is " + difference);
                                        difference *= 2;
                                        authorRating += difference;
                                        opponentRating -= difference;
                                        matchresult = 1;
                                    } else {
                                        eloresults = EloRating.calculate(authorRating, opponentRating, false);
                                        let difference = Math.abs(authorRating - eloresults.playerRating);
                                        console.log("difference is " + difference);
                                        difference *= 2;
                                        authorRating -= difference;
                                        opponentRating += difference;
                                    }
                                    addMatch(author, opponent, todayString, matchresult, message.guild.id, function (err, results5) {
                                        if (err) console.log(err);
                                        else {
                                            console.log("match added");
                                            updateRating(author, authorRating, message.guild.id, function (err, results6) {
                                                if (err) console.log(err);
                                                else {
                                                    updateRating(opponent, opponentRating, message.guild.id, function (err, results7) {
                                                        if (err) console.log(err);
                                                        else message.channel.send(`Recording ${message.author.username}'s ${result} ${opponent}`);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    })
                } else {
                    message.channel.send("You two can have fun with each other, but can only record one match with each other per day.");                    
                }
            });
        } else {
            message.channel.send("You two can have fun with each other, but can only record one match with each other per day.");
        }
    });
}