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
            await QueueHandler.processQueue(client, queueName);
        }
    }
}

EventHandler.RegisterEvent("clientmoved", new ClientMoved());