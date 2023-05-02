import Client from "../classes/Client";
import ClientEvent from "../classes/Event";
import Logger from "../classes/Logger";
import EventHandler from "../handlers/EventHandler";

class Error extends ClientEvent<"error"> {
    public async run(client: Client, error: globalThis.Error): Promise<void> {
        Logger.run("error", error);
    }
}

EventHandler.RegisterEvent("error", new Error());