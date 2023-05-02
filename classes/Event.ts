import Client from "./Client";
import { TeamSpeakEvents } from "../handlers/EventHandler";

abstract class ClientEvent<K extends keyof TeamSpeakEvents> {
    abstract run(client: Client, ...args: TeamSpeakEvents[K]): Promise<void>;
}

export default ClientEvent;