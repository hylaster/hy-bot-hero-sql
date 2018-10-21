import Discord from "discord.js";
import {DataService} from "../data/dataservice";

export interface Command {
    (client: Discord.Client, message: Discord.Message, args: string[], dataService: DataService): void;
}