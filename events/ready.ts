import { env } from "process";
import Client from "../classes/Client";
import ClientEvent from "../classes/Event";
import Logger from "../classes/Logger";
import Utils from "../classes/Utils";
import EventHandler from "../handlers/EventHandler";

class Ready extends ClientEvent<"ready"> {
    public async run(client: Client): Promise<void> {
        Logger.run("info", `Logged in as ${client._config.connectionOptions.nickname} running on ${process.env.ENV?.toUpperCase()}`);

        let me = await client.getClientByName(client._config.connectionOptions.nickname);

        setTimeout(() => {
            me?.move(client._config.botOptions.queueChannelID);
            client.sendTextMessage("0", 2, "[b]Queue Bot has joined the channel and is [color=lime]ready[/color] for commands![/b]");
        }, 10000);

        Utils.updateChannels();
    }
}

EventHandler.RegisterEvent("ready", new Ready());