import { ResponseError } from "ts3-nodejs-library";
import Client from "../classes/Client";
import ClientEvent from "../classes/Event";
import Logger from "../classes/Logger";
import EventHandler from "../handlers/EventHandler";

class Flooding extends ClientEvent<"flooding"> {
    public async run(client: Client, error: ResponseError): Promise<void> {
        if (error) {
            Logger.run("error", error.toString());
            await client._redis.set('floodPrevention', 'true', {EX: 5});
        }
    }
}

EventHandler.RegisterEvent("flooding", new Flooding());