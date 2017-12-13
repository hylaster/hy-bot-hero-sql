exports.run = (client, message, args) => {
    let maxrating = 0;
    let secondrating = 0;
    let topdog = "";
    let runnerup = "";
    console.log("--");
    for (var key of client.records.keyArray()){
        console.log(key);
        let rating = Number(client.records.get(key));
        if (rating > maxrating){
            secondrating = maxrating;
            runnerup = topdog;
            maxrating = rating;
            topdog = client.users.get(key);
        } else if (rating > secondrating){
            secondrating = rating;
            runnerup = client.users.get(key);
        }    
    }
    message.channel.send(`${topdog}'s rating is ${maxrating} and ${runnerup}'s is ${secondrating}`);
}