import { ClientDisconnectEvent } from "ts3-nodejs-library";
import Client from "../classes/Client";
import ClientEvent from "../classes/Event";
import EventHandler from "../handlers/EventHandler";
import QueueHandler from "../handlers/QueueHandler";

class ClientDisconnect extends ClientEvent<"clientdisconnect"> {
    public async run(client: Client, ev: ClientDisconnectEvent): Promise<void> {
        if (await QueueHandler.isClientInQueue(ev.client?.clid as string)) {
            await QueueHandler.removeClientFromQueue(ev.client?.clid as string, false, ev.client?.databaseId as string);
        }
    }
}

EventHandler.RegisterEvent("clientdisconnect", new ClientDisconnect());