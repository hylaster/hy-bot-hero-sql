import { User, Snowflake, Message } from 'discord.js';
import { DataService } from '../../data/dataservice';

export const initUserIfUnranked = (user: User, message: Message, server: Snowflake, initialRating: number, dataService: DataService): Promise<void> => {
  return new Promise((resolve) => {
    dataService.isUserRated(user.id, server).
      then((isRated) => {
        if (!isRated) {
          dataService.initializeUserRating(user.id, server, initialRating).then(_ => {
            console.log('Added user ' + user.id);
            message.channel.send(`${user}'s rating initialised to ${initialRating}`);
            resolve();
          });
        } else {
          resolve();
        }
      }).catch((err) => {
        console.log(err);
      });
  });
};
