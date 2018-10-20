import { Command } from './command';

const comm: Command = (client, message, args, pool) => {
  const member = message.mentions.members.first().user;
  if (!member) return;

  pool.query('SELECT userid, rating FROM UserByServer WHERE userid = ? AND server = ?', [member.id, message.guild.id], function (err, results) {
    console.log(results.length);

    if (!results[0]) {
      pool.query('INSERT INTO UserByServer VALUES (?, ?, 1000);', [member.id, message.guild.id], function (err2) {
        if (err2) {
          console.log(err2);
        } else {
          console.log('Added user ' + member.id);
          message.channel.send(`${member}'s rating initalised to 1000`);
        }
      });
    } else {
      message.channel.send(`${member}'s rating is ${results[0].rating}`);
    }
  });
};

export default comm;
