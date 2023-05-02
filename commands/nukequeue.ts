import { TextMessageEvent } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";
import QueueHandler, { QueueMember } from "../handlers/QueueHandler";

class NukeQueue extends Command {
    public config: CommandConfig = {
        adminOnly: true
    }

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!args[0])
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid arguments. Please follow the format: ${client._config.botOptions.prefix}nukequeue <all/server number> <reason>. Example: ${client._config.botOptions.prefix}nukequeue all Bot Shutting Down...`);

        let serverNum = (args.shift() as string).toLowerCase();
        let reason = args[0] ? args.join(" ") : "Unknown";

        let queue: QueueMember[] = [];

        if (serverNum == "all") {
            for await (let server of client._config.botOptions.queuedChannels.map(s => s.queueName)) {
                queue = queue.concat(...await QueueHandler.getQueue(server));
            }
        } else {
            queue = await QueueHandler.getQueue(serverNum);
        }

        for await (let member of queue) {
            QueueHandler.removeClientFromQueue(member.clientId);
            client.sendTextMessage(member.clientId, 1 , `You have been removed from [b]Queue ${serverNum.toUpperCase()}[/b] because: [color=red]${reason}[/color].`);
        }

        client.sendTextMessage(message.invoker.clid, 1, `[color=red][b]${queue.length}[/b] clients have been nuked from [b]Queue ${serverNum.toUpperCase()}[/b].[/color]`);
    }
}

CommandHandler.RegisterCommand("nukequeue", new NukeQueue());