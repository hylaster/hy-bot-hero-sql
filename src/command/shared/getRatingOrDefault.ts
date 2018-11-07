import { Snowflake } from 'discord.js';
import { DataService } from '../../data/dataservice';

export const getRatingOrDefault = async (userId: Snowflake, server: Snowflake, dataService: DataService): Promise<number> => {
  const ratingFromDatabase = await dataService.getRating(userId, server);
  return ratingFromDatabase == null ? 1000 : ratingFromDatabase;
};
