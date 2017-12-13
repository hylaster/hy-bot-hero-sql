exports.run = (client, message, args) => {
    let maxrating = 0;
    let secondrating = 0;
    let topdog = "";
    let runnerup = "";
    for (var key in client.records.keys()){
        let rating = client.records.get(key);
        if (rating > maxrating){
            secondrating = maxrating;
            runnerup = topdog;
            maxrating = rating;
            topdog = key;
        } else if (rating > secondrating){
            secondrating = rating;
            runnerup = key;
        }
    }
    message.channel.send(`${topdog}'s rating is ${maxrating} and ${runnerup}'s is ${secondrating}`);
}