import { TeamSpeakClient, TextMessageEvent, TextMessageTargetMode } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import QueueHandler from "../handlers/QueueHandler";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";

class QueueKick extends Command {
    public config: CommandConfig = {
        staffOnly: true
    }

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!args[0])
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid arguments. Please follow the format: ${client._config.botOptions.prefix}kick <uniqueID>. Example: ${client._config.botOptions.prefix}kick PJYZN4UcWKNgw4JpCNMe08Frvec=`);

        let uid = args[0];

        let target: TeamSpeakClient | undefined;

        try{
            target = await client.getClientByUid(uid);
        } catch (e) {
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid UniqueID - The UniqueID you supplied cannot be found. Please follow the format: ${client._config.botOptions.prefix}kick <uniqueID>. Example: ${client._config.botOptions.prefix}kick PJYZN4UcWKNgw4JpCNMe08Frvec=`);
        }

        if (!target)
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid UniqueID - The UniqueID you supplied cannot be found. Please follow the format: ${client._config.botOptions.prefix}kick <uniqueID>. Example: ${client._config.botOptions.prefix}setqueue PJYZN4UcWKNgw4JpCNMe08Frvec=p`);

        // Admins can kick absolutely anyone
        // Staff can only kick SiT? and below

        let allowed = false;

        if (message.invoker.servergroups.some(sg => client._config.botOptions.adminGroups.includes(sg))) {
            allowed = true;
        } else {
            // check if target is staff
            if (!target.servergroups.some(sg => [...client._config.botOptions.staffGroups, ...client._config.botOptions.adminGroups].includes(sg))) allowed = true;
        }

        if (allowed) {
            QueueHandler.removeClientFromQueue(target.clid, true);

            client.sendTextMessage(target.clid, 1, `[color=red]You have been kicked from the Queue by ${message.invoker.nickname}![/color]`);

            Utils.sendMessage(message, `[color=orange][b]${message.invoker.nickname}[/b], you have kicked [b]${target.nickname}[/b] from the queue.[/color]`);
        } else {
            Utils.sendMessage(message, `[color=red]You are not allowed to kick this user.[/color]`);
        }
    }
}

CommandHandler.RegisterCommand("queuekick", new QueueKick());