import { HyBotConfig } from './hybot-config';

export interface HyBotMySqlConfig extends HyBotConfig {
  sql: {
    userTableName: string,
    matchTableName: string,
  }
}