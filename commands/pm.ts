import { TextMessageEvent, TextMessageTargetMode } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import CommandHandler from "../handlers/CommandHandler";

class PM extends Command {
    public config: CommandConfig = {
        strictTargetMode: TextMessageTargetMode.CHANNEL
    }

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        client.sendTextMessage(message.invoker.clid, 1, "I have PMed you so that you can run commands here!");
    }
}

CommandHandler.RegisterCommand("pm", new PM());