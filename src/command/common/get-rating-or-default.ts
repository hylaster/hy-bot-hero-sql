import { Snowflake } from 'discord.js';
import { DataService } from '../../data/data-service';

export const getRatingOrDefault = async (user: Snowflake, server: Snowflake, dataService: DataService): Promise<number> => {
  const ratingFromDatabase = await dataService.getRating(user, server);
  return ratingFromDatabase == null ? 1000 : ratingFromDatabase;
};
