import { HyBotConfig } from './hybot-config';

export interface HyBotMySqlConfig extends HyBotConfig {
  sql: {
    databaseUser?: string,
    databasePassword?: string,
    userTableName: string,
    matchTableName: string,
  }
}