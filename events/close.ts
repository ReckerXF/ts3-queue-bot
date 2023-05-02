import Client from "../classes/Client";
import ClientEvent from "../classes/Event";
import Logger from "../classes/Logger";
import EventHandler from "../handlers/EventHandler";

class Close extends ClientEvent<"close"> {
    public async run(client: Client, error: globalThis.Error): Promise<void> {
        Logger.run("error", error.toString());
    }
}

EventHandler.RegisterEvent("close", new Close());