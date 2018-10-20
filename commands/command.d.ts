import Discord from "discord.js";
import mysql from "mysql";

export interface Command {
    (client: Discord.Client, message: Discord.Message, args: string[], pool: mysql.Pool): void;
}