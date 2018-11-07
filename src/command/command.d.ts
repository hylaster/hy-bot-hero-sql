import Discord from "discord.js";
import {DataService} from "../data/dataservice";
import { HyBotConfig } from '../config/hybot-config';

export type Command = (context: CommandContext) => Promise<void>;

export interface CommandContext {
    client: Discord.Client,
    message: Discord.Message,
    args: string[],
    dataService: DataService,
    config: HyBotConfig
}