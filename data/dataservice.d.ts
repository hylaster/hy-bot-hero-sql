import { Snowflake } from 'discord.js';

export type UserRatingPair = {user: Snowflake, rating: number};
export type TopTwo = { RankOne: UserRatingPair, RankTwo: UserRatingPair };

export interface DataService {
    isUserRated(userId: Snowflake, server: Snowflake): Promise<boolean>;
    initializeUserRating(userId: Snowflake, server: Snowflake, rating: number): Promise<void>;
    getRating(userId: Snowflake, server: Snowflake): Promise<number>;
    getTopTwoPlayers(server: Snowflake): Promise<{RankOne: UserRatingPair, RankTwo: UserRatingPair}>;
    areUsersEligibleForMatch(user1: Snowflake, user2: Snowflake, server: Snowflake, date: Date): Promise<boolean>;
    updateRating(userId: Snowflake, rating: number, server: Snowflake): Promise<number>;
    addMatch(author: Snowflake, opponent: Snowflake, server: Snowflake, date: Date, authorWon: boolean): Promise<boolean>;
}