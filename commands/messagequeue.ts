import { TextMessageEvent } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";
import QueueHandler, { QueueMember } from "../handlers/QueueHandler";

class MessageQueue extends Command {
    public config: CommandConfig = {
        adminOnly: true
    }

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!args[0])
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid arguments. Please follow the format: ${client._config.botOptions.prefix}messagequeue <all/queue name> <message>. Example: ${client._config.botOptions.prefix}messagequeue all Hello World!`);

        if (!args[1])
            return Utils.sendMessage(message, `[color=red][Error][/color] No message provided. Please follow the format: ${client._config.botOptions.prefix}messagequeue <all/queue name> <message>. Example: ${client._config.botOptions.prefix}messagequeue all Hello World!`);

        let queueName = (args.shift() as string).toLowerCase();
        let msg = args.join(" ");

        if (!["all", ...client._config.botOptions.queuedChannels.map(s => s.queueName.toLowerCase())].includes(queueName))
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid queue name. Please follow the format: ${client._config.botOptions.prefix}messagequeue <all/server number> <message>. Example: ${client._config.botOptions.prefix}messagequeue all Hello World!`);

        let queue: QueueMember[] = [];

        if (queueName === "all") {
            for await (let server of client._config.botOptions.queuedChannels.map(s => s.queueName)) {
                queue = queue.concat(...await QueueHandler.getQueue(server));
            }
        } else {
            queue = await QueueHandler.getQueue(queueName);
        }

        for await (let member of queue) {
            if (member.clientId == message.invoker.clid) continue;
            if (await client.getClientById(member.clientId)) client.sendTextMessage(member.clientId, 1, `[b]Message for Queue ${queueName.toUpperCase()}:[/b] ${msg}`);
        }

        client.sendTextMessage(message.invoker.clid, 1, `[color=green]Successfully sent message to ${queue.length} members in [b]Queue ${queueName.toUpperCase()}[/b][/color]`);
    }
}

CommandHandler.RegisterCommand("messagequeue", new MessageQueue());
