import Discord from 'discord.js';

export interface HyBotConfig {

  /** Token to be used for the client to login. */
  token: string,

  /**
   * The prefix of a message that indicates that
   */
  prefix: string,

  /**
   * The owning user(s) of the bot. These users can be given privilege to use secured bot commands.
   */
  owners: Discord.Snowflake[],

  /**
   * Option for the bot's client.
   */
  clientConfig: Discord.ClientOptions | undefined,
}