import { TextMessageEvent } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";
import QueueHandler from "../handlers/QueueHandler";

class Recover extends Command {
    public config: CommandConfig = {}
    
    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!await QueueHandler.isClientRecoverable(message.invoker.databaseId))
            return Utils.sendMessage(message, `[color=red][Error][/color] Your queue position is not recoverable. Has it been over 5 minutes since leaving the queue?`);

        await QueueHandler.recoverClient(message.invoker.databaseId).then(() => {
            Utils.sendMessage(message, `[color=green]Successfully recovered your queue position![/color]`);
        });
    }   
}

CommandHandler.RegisterCommand("recover", new Recover());