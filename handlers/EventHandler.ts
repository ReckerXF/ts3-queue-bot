import { ResponseError } from "ts3-nodejs-library";
import { ClientConnect, ClientDisconnect, ClientMoved, Debug, TextMessage, TokenUsed, ServerEdit, ChannelEdit, ChannelCreate, ChannelMove, ChannelDelete } from "ts3-nodejs-library/lib/types/Events";
import Client from "../classes/Client";
import ClientEvent from "../classes/Event";
import Logger from "../classes/Logger";

interface TeamSpeakEvents {
    "error": [Error],
    "ready": [],
    "close": [Error?],
    "flooding": [ResponseError],
    "debug": [Debug],
    "clientconnect": [ClientConnect],
    "clientdisconnect": [ClientDisconnect],
    "tokenused": [TokenUsed],
    "textmessage": [TextMessage],
    "clientmoved": [ClientMoved],
    "serveredit": [ServerEdit],
    "channeledit": [ChannelEdit],
    "channelcreate": [ChannelCreate],
    "channelmoved": [ChannelMove],
    "channeldelete": [ChannelDelete]
}

class EventHandler {
    private static _client: Client;

    public static init(client: Client): void {
        this._client = client;
    }

    public static RegisterEvent<K extends keyof TeamSpeakEvents>(name: K, event: ClientEvent<K>) {
        Logger.run("info", `Registering event: ${name}`);

        //@ts-ignore
        this._client.on(name, (...args: any[]) => event.run(this._client, ...args));
    }
}

export default EventHandler;
export {
    TeamSpeakEvents
}