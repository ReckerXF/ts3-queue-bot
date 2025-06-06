import Client from "./Client";
import { TeamSpeakChannel, TeamSpeakClient, TextMessageEvent, TextMessageTargetMode } from "ts3-nodejs-library";
import QueueHandler from "../handlers/QueueHandler";
import Logger from "./Logger";

/**
 * Utilities - Contains several utilitarian methods.
 */
class Utils {
    private static _client: Client;

    public static init(client: Client) {
        this._client = client;
    }

    public static sendMessage(event: TextMessageEvent, message: string): void {
        switch (event.targetmode) {
            case TextMessageTargetMode.CLIENT:
                return this._client.sendTextMessage(event.invoker.clid, TextMessageTargetMode.CLIENT, message);
            case TextMessageTargetMode.CHANNEL:
                return this._client.sendTextMessage("0", TextMessageTargetMode.CHANNEL, message);
            case TextMessageTargetMode.SERVER:
                return this._client.sendTextMessage("0", TextMessageTargetMode.SERVER, message);
        }
    }

    public static getUniqueArray<T extends Object>(arr: T[], key: string) {
        return [...new Map(arr.map((item: { [x: string]: any; }) => [item[key], item])).values()];
    }

    public static async updateChannels(): Promise<void> {
        for await (let queue of this._client._config.botOptions.queuedChannels) {
            let queueList = await QueueHandler.getQueue(queue.queueName);

            let mappedQueue = (await Promise.all(queueList.map(async (entry, index) => {
                let nickname;
    
                if (!entry.clientNickname) {
                    nickname = (await this._client.getClientById(entry.clientId))?.nickname;
                } else {
                    nickname = entry.clientNickname;
                }
    
                return `[b]${index + 1}:[/b] ${nickname} ${entry.comments ?? ""}\n`
            }))).join().replace(/,/g, "");

            if (!mappedQueue || !queueList)
                mappedQueue = "No clients are queued for this channel!";

            let currentChannelName = (await this._client.channelInfo(queue.channel)).channelName;
            
            if (currentChannelName.includes("Queue:")) {
                currentChannelName = currentChannelName.split("|")[0].trim() + ` | Queue: ${(await QueueHandler.getQueue(queue.queueName)).length}`;
            } else {
                if (currentChannelName.length > 26) { // Allows for " Queue: 000" to be added to the end of the channel name. Up to 3-numbered queues.
                    Logger.run("error", `Could not update the channel for channel ID ${queue.channel} due to excessive name length. Is your channel name more than 26 characters? The bot will be unable to update the channel name/description until this is fixed.`);
                    return;
                }

                currentChannelName = currentChannelName.trim() + ` | Queue: ${(await QueueHandler.getQueue(queue.queueName)).length}`;
            }

            this._client.channelEdit(queue.channel, {channelName: currentChannelName, channelDescription: `[size=10][color=lightblue][b][Queue][/b][/color][/size]\n${mappedQueue}`}).catch(reason => {
                if (reason.msg == "channel name is already in use")
                    return; // Ignore this error since the channel more than likely doesn't need to update it's name.
            });
        }
    }

    public static async channelsClear(client: Client, channels: TeamSpeakChannel.ChannelType[]) {
        let count = 0;

        for (let channel of channels) count += (await client.getChannelById(channel))?.totalClients as number;
        return count;
    }
}

export default Utils;