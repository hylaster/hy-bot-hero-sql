import { Snowflake } from 'discord.js';
import SortedSet from 'collections/sorted-set';
// @ts-ignore
import SortedMap from 'collections/sorted-map';
import { DatedMatchOutcome } from '../data-service';
import { datesAreOnSameDay } from '../../common';

type UserSnowflake = Snowflake;

type UserPairKey = string;

type MatchResultsByDates = Map<UserPairKey, SortedMap<Date, { winner: UserSnowflake, author: UserSnowflake }>>;
type MatchDatesByUsers = Map<UserPairKey, SortedSet<Date>>;

export class MatchHistoryRecorder {

  private matchResultsByUserPair: MatchResultsByDates = new Map();
  private matchDatesIndex: MatchDatesByUsers = new Map();

  public getMatchHistory(user: UserSnowflake, otherUser: UserSnowflake): DatedMatchOutcome[] {

    const playerMatchHistory = this.matchResultsByUserPair.get(this.getUniqueKeyFromUsers(user, otherUser));

    if (playerMatchHistory == null) return [];

    const playerMatchEntries = playerMatchHistory.entries();

    return playerMatchEntries.map((entry: [UserSnowflake,{winner: UserSnowflake, author: UserSnowflake}]) => {
      return {
        date: entry[0],
        winner: entry[1].winner,
        author: entry[1].author
      };
    });
  }

  public usersHadMatchOnDate(user: UserSnowflake, otherUser: UserSnowflake, date: Date) {

    const matchDates = this.matchDatesIndex.get(this.getUniqueKeyFromUsers(user, otherUser));

    if (matchDates == null) return false;

    const greatestLessThanDate = matchDates.findGreatestLessThanOrEqual(date);
    const leastGreaterThanDate = matchDates.findLeastGreaterThanOrEqual(date);

    // Type assertions are needed due to the error in the DefinitelyTyped typings.
    if (greatestLessThanDate != null && datesAreOnSameDay(date, (greatestLessThanDate as any).value)) return true;
    if (leastGreaterThanDate != null && datesAreOnSameDay(date, (leastGreaterThanDate as any).value)) return true;

    return false;
  }

  public recordMatch(user: UserSnowflake, otherUser: UserSnowflake, date: Date, winner: UserSnowflake, author: UserSnowflake) {
    const updateDateIndex = (userPairKey: string, date: Date) => {

      if (!this.matchDatesIndex.has(userPairKey)) {
        this.matchDatesIndex!.set(userPairKey, new SortedSet<Date>());
      }

      const matchDates = this.matchDatesIndex!.get(userPairKey);

      matchDates!.add(date);
    };

    const uniqueUserPairKey = this.getUniqueKeyFromUsers(user, otherUser);

    updateDateIndex(uniqueUserPairKey, date);

    if (!this.matchResultsByUserPair.has(uniqueUserPairKey)) {
      this.matchResultsByUserPair!.set(uniqueUserPairKey, new SortedMap());
    }

    this.matchResultsByUserPair!.get(uniqueUserPairKey)!.set(date, { winner, author });
  }

  private getUniqueKeyFromUsers(user: UserSnowflake, otherUser: UserSnowflake): UserPairKey {
    const user1 = user < otherUser ? user : otherUser;
    const user2 = user < otherUser ? otherUser : user;

    return user1 + user2;
  }
}
