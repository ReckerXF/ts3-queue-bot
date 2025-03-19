import { ClientMovedEvent, TeamSpeakChannel, TeamSpeakClient } from "ts3-nodejs-library";
import Client from "../classes/Client";
import ClientEvent from "../classes/Event";
import Logger from "../classes/Logger";
import Utils from "../classes/Utils";
import EventHandler from "../handlers/EventHandler";
import QueueHandler from "../handlers/QueueHandler";

class ClientMoved extends ClientEvent<"clientmoved"> {
    private processed: {[key: string]: Date | null} = {};

    public async run(client: Client, ev: ClientMovedEvent): Promise<void> {
        // Handle queue items
        if (await QueueHandler.isClientInQueue(ev.client.clid)) {
            let q = await QueueHandler.getClientQueue(ev.client.clid);
    
            if (ev.channel.cid === q.queue.channel) {
                if (q.position !== 1 && !ev.client.servergroups.some(group => [...client._config.botOptions.staffGroups, ...client._config.botOptions.adminGroups].includes(group))) {
                    // Move back
                    try {
                        ev.client.move(client._config.botOptions.queueChannelID);
                    }

                    catch (error) {
                        Logger.run("error", error);
                        client.sendTextMessage(ev.client.clid, 1, "[b][color=red]An error has been reported. Please report this error to an Administrator:[/color][/b] " + error);
                    }

                    client.sendTextMessage(ev.client.clid, 1, `[color=red][Queue Notification][/color] You have been moved back into the queue. Please do not skip!`);
                }
            } else if (ev.channel.cid == client._config.botOptions.afkChannelID) {
                let queueName = await QueueHandler.getClientQueueName(ev.client.clid);
                QueueHandler.removeClientFromQueue(ev.client.clid);
                client.sendTextMessage(ev.client.clid, 1, `[color=red]You have been removed from queue due to joining/being moved to an AFK channel![/color]`);
                QueueHandler.notifyQueueOfPositionChange(queueName);
            }
        }

        // Handle person leaving queueName
        for (let { queueName } of client._config.botOptions.queuedChannels) {
            await this.handleFirstPositionInQueue(client, queueName);
        }
        
    }

    private async handleFirstPositionInQueue(client: Client, name: string, position: number = 0) {
        let first = await QueueHandler.getClientInQueuePosition(name, position);

        if (first) {
            let c = await client.getClientById(first.clientId) as TeamSpeakClient;

            if (!c || c == null)
                await QueueHandler.removeClientFromQueue(first.clientId);

            // Check if the excluded channels have anyone in them
            if (c && await Utils.channelsClear(client, client._config.botOptions.queuedChannels.filter(c => c.queueName == name)[0].freezeQueueChannels) == 0) {
                let chName = (await client.getChannelById(c.cid))?.name.toLowerCase() as string;
                if (!["staff room", "senior staff", "administration", "interview room", "AFK"].some(r => chName.includes(r))) {

                    let ch = await client.getChannelById(first.queue.channel) as TeamSpeakChannel;

                    if ((ch.totalClients < ch.maxclients) &&await QueueHandler.isClientInQueue(c.clid)) {
                        if (this.processed[c.clid] && this.processed[c.clid] !== null && Math.round(Math.abs(new Date().getUTCMilliseconds() - (this.processed[c.clid] as Date).getUTCMilliseconds()) / 1000) <= 5) return;
                        this.processed[c.clid] = new Date();
                        client.clientPoke(c.clid, `You are about to be moved into [b]${ch.name}[/b]. Standby!`);

                        setTimeout(async () => {
                            let queueName = await QueueHandler.getClientQueueName(c.clid);
                            await QueueHandler.removeClientFromQueue(c.clid);
                            QueueHandler.notifyQueueOfPositionChange(queueName);

                            await c.move(first.queue.channel);
                            this.processed[c.clid] = null;

                        }, 5000);
                    }

                } else {
                    this.handleFirstPositionInQueue(client, name, position + 1);
                }
            } else {
                setTimeout(() => {
                    this.handleFirstPositionInQueue(client, name);
                }, 10000);
            }
        }

    }
}

EventHandler.RegisterEvent("clientmoved", new ClientMoved());