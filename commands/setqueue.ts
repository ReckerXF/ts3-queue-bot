import { QueryProtocol, TeamSpeakClient, TextMessageEvent } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";
import QueueHandler from "../handlers/QueueHandler";

class SetQueue extends Command {
    public config: CommandConfig = {
        staffOnly: true
    }

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!args[0] || !args[1])
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid arguments. Please follow the format: ${client._config.botOptions.prefix}setqueue <uniqueID> <position>. Example: ${client._config.botOptions.prefix}setqueue PJYZN4UcWKNgw4JpCNMe08Frvec= 1`);

        let uid = args[0];
        let pos = parseInt(args[1]);

        if (isNaN(pos))
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid position. Please follow the format: ${client._config.botOptions.prefix}setqueue <uniqueID> <position>. Example: ${client._config.botOptions.prefix}setqueue PJYZN4UcWKNgw4JpCNMe08Frvec= 1`);

        let target: TeamSpeakClient | undefined;

        try{
            target = await client.getClientByUid(uid);
        } catch (e) {
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid UniqueID - The UniqueID you supplied cannot be found. Please follow the format: ${client._config.botOptions.prefix}setqueue <uniqueID> <position>. Example: ${client._config.botOptions.prefix}setqueue PJYZN4UcWKNgw4JpCNMe08Frvec= 1`);
        }

        if (!target)
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid UniqueID - The UniqueID you supplied cannot be found. Please follow the format: ${client._config.botOptions.prefix}setqueue <uniqueID> <position>. Example: ${client._config.botOptions.prefix}setqueue PJYZN4UcWKNgw4JpCNMe08Frvec= 1`);

        if (!await QueueHandler.isClientInQueue(target.clid))
            return Utils.sendMessage(message, `[color=red][Error][/color] The client you specified is not in the queue. Please follow the format: ${client._config.botOptions.prefix}setqueue <uniqueID> <position>. Example: ${client._config.botOptions.prefix}setqueue PJYZN4UcWKNgw4JpCNMe08Frvec= 1`);

        QueueHandler.setClientQueuePosition(target.clid, pos - 1);
        Utils.sendMessage(message, `[b]${message.invoker.nickname}[/b], you have moved [b]${target.nickname}[/b] to queue position [b]${pos}[/b]!`);
        client.sendTextMessage(target.clid, 1, `[b]${message.invoker.nickname}[/b] has moved you to queue position [b]${pos}[/b]!`);
    }
    
}

CommandHandler.RegisterCommand("setqueue", new SetQueue());