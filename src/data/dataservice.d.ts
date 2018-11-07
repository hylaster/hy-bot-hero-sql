import { Snowflake } from 'discord.js';

type NullableUserRatingPair = UserRatingPair | null;

export type UserRatingPair = {userId: Snowflake, rating: number};

export interface DataService {
    isUserRated(userId: Snowflake, server: Snowflake): Promise<boolean>;
    initializeUserRating(userId: Snowflake, server: Snowflake, rating: number): Promise<void>;
    getRating(userId: Snowflake, server: Snowflake): Promise<number>;
    updateRating(userId: Snowflake, rating: number, server: Snowflake): Promise<number>;
    areUsersEligibleForMatch(user1: Snowflake, user2: Snowflake, server: Snowflake, date: Date): Promise<boolean>;
    addMatch(author: Snowflake, opponent: Snowflake, server: Snowflake, date: Date, authorWon: boolean): Promise<void>;
    getTopNPlayers(server: Snowflake, n: number): Promise<UserRatingPair[]>;
}