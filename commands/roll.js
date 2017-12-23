exports.run = (client, message, args, pool) => {
    let dice = args.join("").trim();
    let numdice = dice.split("d")[0];
    
    let diceAndModifier = dice.split("d")[1];
    
    let maxroll = 0;
    let modifier = 0;
    if (diceAndModifier.indexOf("+") != -1){
        maxroll = diceAndModifier.split("+")[0];
        modifier = diceAndModifier.split("+")[1];
    } else if (diceAndModifier.indexOf("-") != -1){
        maxroll = diceAndModifier.split("-")[0];
        modifier = diceAndModifier.split("-")[1] * -1;
    } else {
        maxroll = diceAndModifier;
    }

    let results = [];
    let total = Number(modifier);
    let i;
    for (i = 0; i < numdice; i++){
        let n = Math.floor(Math.random() * maxroll + 1);
        results.push(n);
        total += n;
    }

    message.channel.send("Results: " + results.join(" ") + " | Total With Modifier: " + total);
}