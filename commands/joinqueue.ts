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
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid arguments.[/color] Please follow the format: ${client._config.botOptions.prefix}joinqueue servername. [b]Example:[/b] ${client._config.botOptions.prefix}joinqueue X`);

        let channelNum = args[0].toLowerCase();

        if (!client._config.botOptions.queuedChannels.map(c => c.queueName.toLowerCase()).includes(channelNum))
            return Utils.sendMessage(message, `[color=red][Error][/color] Invalid server parameter. Please follow the format: ${client._config.botOptions.prefix}joinqueue servername. [b]Example:[/b] ${client._config.botOptions.prefix}joinqueue X`);

        if (await QueueHandler.isClientInQueue(message.invoker.clid))
            return Utils.sendMessage(message, `[color=red][Error][/color] You are already in the queue.`);
        
        let queue = await QueueHandler.getQueue(channelNum);
        let c = await client.getChannelById(client._config.botOptions.queuedChannels.find(c => c.queueName.toLowerCase() === channelNum)?.channel as string) as TeamSpeakChannel;

        let excludedSubsClear = await Utils.channelsClear(client, client._config.botOptions.queuedChannels.find(c => c.queueName.toLowerCase() == channelNum)?.excludedSubChannels as string[]) == 0;
        let freezeChanClear = await Utils.channelsClear(client, client._config.botOptions.queuedChannels.find(c => c.queueName.toLowerCase() == channelNum)?.freezeQueueChannels as string[]) == 0;

        try
        {
            if (c.totalClients < c.maxclients && excludedSubsClear && freezeChanClear && queue.length == 0) {
                message.invoker.move(client._config.botOptions.queuedChannels.find(c => c.queueName.toLowerCase() == channelNum)?.channel as string);
    
                Utils.sendMessage(message, `[b]${message.invoker.nickname}[/b], you are being automatically moved into [b]${c.name}[/b] as there are open spots. Have fun!`);
            } else QueueHandler.addClientToQueue(message.invoker.nickname, message.invoker.clid, channelNum);
        }
        
        catch (error: any)
        {
            console.log(error);
        }

    }
}

// NOTE: Fixed the redis errors, now dealing with some migration issues that I overlooked beforehand. Made it so the joinqueue command checks the channel count.

CommandHandler.RegisterCommand("joinqueue", new JoinQueue());