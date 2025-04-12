import { TeamSpeakChannel, TeamSpeakClient, TextMessageEvent, TextMessageTargetMode } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";
import QueueHandler from "../handlers/QueueHandler";

class ForceQueue extends Command {
    public config: CommandConfig = {
        staffOnly: true
    }

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!args[0])
            return Utils.sendMessage(message, `[color=red][Error][/color] Please follow the format: ${client._config.botOptions.prefix}forcequeue <name>. Example: ${client._config.botOptions.prefix}forcequeue 1`);

        QueueHandler.processQueue(client, args[0], 0, message).catch(e => {
            console.error(e);
        });
    }
}

CommandHandler.RegisterCommand("forcequeue", new ForceQueue());