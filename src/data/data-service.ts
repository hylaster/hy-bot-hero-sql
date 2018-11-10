import { Snowflake } from 'discord.js';

export type UserRatingPair = {userId: Snowflake, rating: number};

export interface DataService {
  isUserRated(userId: Snowflake, server: Snowflake): Promise<boolean>;
  getRating(userId: Snowflake, server: Snowflake): Promise<number | null>;
  setRating(userId: Snowflake, rating: number, server: Snowflake): Promise<number>;
  areUsersEligibleForMatch(user1: Snowflake, user2: Snowflake, server: Snowflake, date: Date): Promise<boolean>;
  addMatch(author: Snowflake, opponent: Snowflake, server: Snowflake, date: Date, authorWon: boolean): Promise<void>;
  getTopNPlayers(server: Snowflake, n: number): Promise<UserRatingPair[]>;
}
