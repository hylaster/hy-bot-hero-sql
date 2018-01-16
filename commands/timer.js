
exports.run = (client, message, args, pool) => {
    let time = Number(args[0]) * 1000;
    let author = message.author;
    setTimeout(function(){
        message.channel.send(`${author}'s timer of length ${args[0]} seconds has reached zero.`)
    }, time);
}