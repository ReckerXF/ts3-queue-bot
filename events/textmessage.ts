import { TextMessageEvent, TextMessageTargetMode } from "ts3-nodejs-library";
import Client from "../classes/Client";
import ClientEvent from "../classes/Event";
import EventHandler from "../handlers/EventHandler";
import Utils from "../classes/Utils";
import Logger from "../classes/Logger";

class TextMessage extends ClientEvent<"textmessage"> {
    private commandCooldown: {[key: string]: Date} = {};

    public async run(client: Client, message: TextMessageEvent): Promise<void> {

        const rawMessage = message.msg;

        if (!rawMessage.startsWith(client._config.botOptions.prefix)) return;
        const args = rawMessage.split(" ");
        const command = args.shift()?.slice(client._config.botOptions.prefix.length).toLowerCase();
        const cmd = client.getCommand(command || "");

        if (!cmd) return;

        if (cmd.config.adminOnly && !message.invoker.servergroups.some(group => client._config.botOptions.adminGroups.includes(group)))
            return Utils.sendMessage(message, `[color=red]Access Denied.[/color]`);
        
        if (cmd.config.staffOnly && !message.invoker.servergroups.some(group => [...client._config.botOptions.staffGroups, ...client._config.botOptions.adminGroups].includes(group)))
            return Utils.sendMessage(message, `[color=red]Access Denied.[/color]`);

        if (cmd.config.strictTargetMode && message.targetmode !== cmd.config.strictTargetMode) {
            switch (cmd.config.strictTargetMode) {
                case TextMessageTargetMode.CLIENT:
                    return Utils.sendMessage(message, `[color=red]This command must be executed in DMs![/color]`);
                case TextMessageTargetMode.CHANNEL:
                    return Utils.sendMessage(message, `[color=red]This command must be executed in the Queue channel![/color]`);
                case TextMessageTargetMode.SERVER:
                    return Utils.sendMessage(message, `[color=red]This command must be executed in the teamspeak server channel![/color]`);
            }
        }

        try {
            //if (this.commandCooldown[message.invoker.clid] && this.commandCooldown[message.invoker.clid] !== null && new Date() < (this.commandCooldown[message.invoker.clid] as Date)) {
                // @ts-ignore
            //    return Utils.sendMessage(message, `[color=red]You are on a command cooldown... ${10 - Math.round(Math.abs((this.commandCooldown[message.invoker.clid] as Date) - new Date()) / 1000)} seconds remaining.[/color]`);
            //}

            if (await client._redis.get('floodPrevention') == 'true' && client._redis.exists('floodPrevention'))
                return Utils.sendMessage(message, `[color=red][Flood Prevention][/color] The query is being flooded with commands. Please slow down command inputs, and try again in a few moments.`);

            cmd.run(client, message, args);

            // Setting timestamp for the command cooldown.
            //let t = new Date();
            //t.setSeconds(t.getSeconds() + 10)
            //this.commandCooldown[message.invoker.clid] = t;

        } catch(e) {
            Logger.run("error", e.toString());
            Utils.sendMessage(message, `[color=red]An unknown error has occured and has been logged for review...[/color]`);
        }

        Logger.run("info", `${message.invoker.nickname} has ran the command "${command}" with parameters: ${args.join(" ") || "N/A"}`);
    }
}

EventHandler.RegisterEvent("textmessage", new TextMessage());