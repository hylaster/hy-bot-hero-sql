import { Snowflake } from 'discord.js';

export const nameof = <T>(key: keyof T) => key;

export function datesAreOnSameDay(date: Date, otherDate: Date) {
  return (date.getDate() === otherDate.getDate() &&
    date.getMonth() === otherDate.getMonth() &&
    date.getFullYear() === otherDate.getFullYear());
}

export function getUsersAsOrderedPair(user: Snowflake, otherUser: Snowflake): [Snowflake, Snowflake] {
  return user < otherUser ? [user, otherUser] : [otherUser, user];
}
