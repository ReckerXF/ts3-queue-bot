import { TextMessageEvent } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";
import QueueHandler from "../handlers/QueueHandler";

class QueueList extends Command {
    public config: CommandConfig = {}

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!args[0])
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid arguments. Please follow the format: ${client._config.botOptions.prefix}queuelist <queue name>. [b]Example:[/b] ${client._config.botOptions.prefix}queuelist A`);

        let queueName = args[0].toLowerCase();

        if (client._config.env == "livetesting" && queueName !== "x") {
            return Utils.sendMessage(message, `[color=red][Error][/color] This server is not available in live testing.`);
        }

        if (!client._config.botOptions.queuedChannels.map(c => c.queueName.toLowerCase()).includes(queueName))
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid server number. Please follow the format: ${client._config.botOptions.prefix}queuelist <queueName>. [b]Example:[/b] ${client._config.botOptions.prefix}queuelist A`);

        let queueList = await QueueHandler.getQueue(queueName);

        let mappedQueue = (await Promise.all(queueList.map(async (entry, index) => {
            let nickname;

            if (!entry.clientNickname) {
                nickname = (await client.getClientById(entry.clientId))?.nickname;
            } else {
                nickname = entry.clientNickname;
            }

            return `[b]${index + 1}:[/b] ${entry.clientId == message.invoker.clid ? `[color=green][b]${nickname}[/b][/color]` : nickname} ${entry.comments ?? ""}\n`
        }))).join();

        if (mappedQueue == "")
            return Utils.sendMessage(message, `[b]${message.invoker.nickname}[/b], there are no clients in [b]Queue ${queueName}[/b]!`);

        Utils.sendMessage(message, `The following clients are in [b]Queue ${queueName.toUpperCase()}[/b]: \n${mappedQueue.replace(/,/g, "")}`);

    }
    
}

CommandHandler.RegisterCommand("queuelist", new QueueList());