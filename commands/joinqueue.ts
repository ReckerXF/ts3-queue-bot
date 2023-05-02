import CommandHandler from "../handlers/CommandHandler";
import Command, { CommandConfig } from "../classes/Command";
import { TeamSpeakChannel, TextMessageEvent, TextMessageTargetMode } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Utils from "../classes/Utils";
import QueueHandler from "../handlers/QueueHandler";

class JoinQueue extends Command {
    public config: CommandConfig = {
        strictTargetMode: TextMessageTargetMode.CHANNEL,
        memberOnly: true
    }

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {

        if (!args[0])
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid arguments.[/color] Please follow the format: ${client._config.botOptions.prefix}joinqueue <name>. [b]Example:[/b] ${client._config.botOptions.prefix}joinqueue A`);

        let queueName = args[0].toLowerCase();

        if (!client._config.botOptions.queuedChannels.map(c => c.queueName.toLowerCase()).includes(queueName))
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid queue number. Please follow the format: ${client._config.botOptions.prefix}joinqueue <name> [b]Example:[/b] ${client._config.botOptions.prefix}joinqueue A`);

        if (await QueueHandler.isClientInQueue(message.invoker.clid))
            return Utils.sendMessage(message, `[color=red][Error][/color] You are already in the queue.`);
        
        let queue = await QueueHandler.getQueue(queueName);
        let c = await client.getChannelById(client._config.botOptions.queuedChannels.find(c => c.queueName.toLowerCase() === queueName)?.channel as string) as TeamSpeakChannel;

        if (queue.length == 0) {
            message.invoker.move(client._config.botOptions.queuedChannels.find(c => c.queueName.toLowerCase() == queueName)?.channel as string);

            Utils.sendMessage(message, `[b]${message.invoker.nickname}[/b], you are being automatically moved into [b]${c.name}[/b] as there are open spots. Have fun!`);
        } else QueueHandler.addClientToQueue(message.invoker.nickname, message.invoker.clid, queueName);

    }
}

CommandHandler.RegisterCommand("joinqueue", new JoinQueue());