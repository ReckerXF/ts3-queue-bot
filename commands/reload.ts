import { TextMessageEvent } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";

class Reload extends Command {
    public config: CommandConfig = {
        adminOnly: true
    }
    
    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!args[0])
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid arguments. Please follow the format: ${client._config.botOptions.prefix}reload <command>. Example: ${client._config.botOptions.prefix}reload joinqueue`);

        if (!client.getCommand(args[0].toLowerCase()))
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid command. Please follow the format: ${client._config.botOptions.prefix}reload <command>. Example: ${client._config.botOptions.prefix}reload joinqueue`);

        Utils.sendMessage(message, `Attempting to reload command: ${args[0]}`);
        
        let rStatus = client.reloadCommand(args[0].toLowerCase());

        if (rStatus) {
            Utils.sendMessage(message, `[color=green]Successfully reloaded command: ${args[0]}[/color]`);
        } else {
            Utils.sendMessage(message, `[color=red][Error][/color] Failed to reload command: ${args[0]}[/color]`);
        }
    }   
}

CommandHandler.RegisterCommand("reload", new Reload());