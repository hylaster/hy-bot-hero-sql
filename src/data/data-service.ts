import { Snowflake } from 'discord.js';

export type UserRatingPair = {user: Snowflake, rating: number};

export type DatedMatchOutcome = {
  date: Date;
  winner: Snowflake;
  author: Snowflake;
};

export interface DataService {
  isUserRated(user: Snowflake, server: Snowflake): Promise<boolean>;

  getRating(user: Snowflake, server: Snowflake): Promise<number | undefined>;

  setRating(user: Snowflake, rating: number, server: Snowflake): Promise<void>;

  areUsersEligibleForMatch(user1: Snowflake, user2: Snowflake, server: Snowflake,
    date: Date): Promise<boolean>;

  addMatch(user1: Snowflake, user2: Snowflake, server: Snowflake, date: Date, winner: Snowflake,
    author: Snowflake): Promise<void>;

  getMatchHistory(user1: Snowflake, user2: Snowflake, server: Snowflake): Promise<DatedMatchOutcome[]>;

  getTopNPlayers(server: Snowflake, n: number): Promise<UserRatingPair[]>;
}
