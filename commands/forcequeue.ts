import { TeamSpeakChannel, TeamSpeakClient, TextMessageEvent, TextMessageTargetMode } from "ts3-nodejs-library";
import Client from "../classes/Client";
import Command, { CommandConfig } from "../classes/Command";
import Utils from "../classes/Utils";
import CommandHandler from "../handlers/CommandHandler";
import QueueHandler from "../handlers/QueueHandler";

class ForceQueue extends Command {
    public config: CommandConfig = {
        staffOnly: true
    }

    public async run(client: Client, message: TextMessageEvent, args: string[]): Promise<void> {
        if (!args[0])
            return Utils.sendMessage(message, `[color=red][Error][/color] Please follow the format: ${client._config.botOptions.prefix}forcequeue <name>. Example: ${client._config.botOptions.prefix}forcequeue 1`);

        this.forceQueueToMove(client, message, args[0]).catch(e => {
            console.error(e);
            return Utils.sendMessage(message, `[color=red][Error][/color] Please follow the format: ${client._config.botOptions.prefix}forcequeue <name>. Example: ${client._config.botOptions.prefix}forcequeue 1`);
        });
    }

    private async forceQueueToMove(client: Client, message: TextMessageEvent, name: string, position: number = 0) {
        let first = await QueueHandler.getClientInQueuePosition(name, position);

        if (first) {
            let c = await client.getClientById(first.clientId) as TeamSpeakClient;

            if (!c || c == null)
                await QueueHandler.removeClientFromQueue(first.clientId, false);

            // Check if the freezeQueueChannels have anyone in them
            if (c) {
                let chName = (await client.getChannelById(c.cid))?.name.toLowerCase() as string;
                if (!first.queue.freezeQueueChannels.some(r => chName.includes(r))) {

                    let ch = await client.getChannelById(first.queue.channel) as TeamSpeakChannel;

                    if (await QueueHandler.isClientInQueue(c.clid)) {
                        Utils.sendMessage(message, `[color=green]Successfully forced Queue ${name.toUpperCase()} to move![/color]`);
                        client.clientPoke(c.clid, `You are about to be moved into [b]${ch.name}[/b]. Standby!`);

                        setTimeout(async () => {
                            let server = await QueueHandler.getClientQueueName(c.clid);
                            await QueueHandler.removeClientFromQueue(c.clid);
                            QueueHandler.notifyQueueOfPositionChange(server);

                            await c.move(first.queue.channel);

                        }, 5000);
                    } else {
                        Utils.sendMessage(message, `[color=red][Error][/color] There are no spots available! This command is only for use when the designated freeze channels are taking up extended periods of time.`);
                    }

                } else {
                    this.forceQueueToMove(client, message, name, position + 1);
                }
            }
        }

    }
    
}

CommandHandler.RegisterCommand("forcequeue", new ForceQueue());