import { TextMessageEvent } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";
import QueueHandler from "../handlers/QueueHandler";

class QueuePos extends Command {
    public config: CommandConfig = {}

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!QueueHandler.isClientInQueue(message.invoker.clid)) return Utils.sendMessage(message, `[color=red]Error: You are not in a queue.[/color]`);
        Utils.sendMessage(message,  `[b]${message.invoker.nickname}[/b], you are currently in queue position [b]${await QueueHandler.getClientQueuePosition(message.invoker.clid)}[/b].`);
    }
    
}

CommandHandler.RegisterCommand("queuepos", new QueuePos());