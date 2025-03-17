import { TextMessageEvent, TextMessageTargetMode } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import QueueHandler from "../handlers/QueueHandler";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";

class LeaveQueue extends Command {
    public config: CommandConfig = {}

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!await QueueHandler.isClientInQueue(message.invoker.clid))
            return Utils.sendMessage(message, `[color=red][Error][/color] You are not in a server queue.`);

        let queueName = await QueueHandler.getClientQueueName(message.invoker.clid);

        await QueueHandler.removeClientFromQueue(message.invoker.clid, false, message.invoker.databaseId);
        Utils.sendMessage(message, `[b]${message.invoker.nickname}[/b], you have been removed from the queue.`);

        QueueHandler.notifyQueueOfPositionChange(queueName);
    }
}

CommandHandler.RegisterCommand("leavequeue", new LeaveQueue());