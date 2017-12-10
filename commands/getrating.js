exports.run = (client, message, args) => {
    let member = message.mentions.members.first().user;
    let rating = client.records.get(member.id) || 1000;   
    message.channel.send(`${member}'s rating is ${rating}`);
}