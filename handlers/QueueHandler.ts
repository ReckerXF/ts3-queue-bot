import Client from "../classes/Client";
import Utils from "../classes/Utils";
import { QueuedChannel } from "../types/Config.type";
import { TeamSpeakClient, TeamSpeakChannel, TextMessageEvent } from "ts3-nodejs-library";

class QueueMember {
    clientNickname: string;
    clientId: string;
    position?: number;
    comments?: string;
    queue: QueuedChannel;
    
    constructor(clientNickname: string, clientId: string, queue: QueuedChannel) {
        this.clientNickname = clientNickname;
        this.clientId = clientId;
        this.queue = queue;
    }
}

class QueueHandler {
    private static _client: Client;

    static init(client: Client) {
        this._client = client;
    }

    static processed: {[key: string]: Date | null} = {};

    static async addClientToQueue(clientNickname: string, clientId: string, queueName: string, recoveryMode: boolean = false) {
        let rawData = await this._client._redis.get(`queue:${queueName.toLowerCase()}`);
        let queuedMembers: QueueMember[] = JSON.parse(rawData && rawData.trim() !== "" ? rawData : "[]");

        let queueMember = new QueueMember(clientNickname, clientId, this._client._config.botOptions.queuedChannels.filter((c: { queueName: string; }) => c.queueName == queueName.toLowerCase())[0]);

        queuedMembers.push(queueMember);

        let queueIndex: { [key: string]: string; } = JSON.parse(await this._client._redis.get("queuedClients") ?? "");
        queueIndex[clientId] = queueName.toLowerCase();

        await this._client._redis.set(`queue:${queueName.toLowerCase()}`, JSON.stringify(queuedMembers));
        await this._client._redis.set("queuedClients", JSON.stringify(queueIndex));

        if (!recoveryMode) {
            await this._client.sendTextMessage("0", 2, `[b]${clientNickname}[/b], you have joined the queue for [b]${queueName.toUpperCase()}[/b]. You are currently [b]#${queuedMembers.length}[/b] in queue.`);
            Utils.updateChannels();
        }
    }

    static async getClientQueueName(clientId: string) {
        let queueIndex: { [key: string]: string; } = JSON.parse(await this._client._redis.get("queuedClients") ?? "");

        return queueIndex[clientId];
    }

    static async removeClientFromQueue(clientId: string, isKicked: boolean = false, databaseId?: string) {
        let queueIndex: { [key: string]: string; } = JSON.parse(await this._client._redis.get("queuedClients") ?? "[]");

        let q: QueueMember[] = JSON.parse(await this._client._redis.get(`queue:${queueIndex[clientId]}`) ?? "[]");

        let newQueue = q.filter(m => (m?.clientId ?? "") !== clientId);

        let clientData = q.filter(m => (m?.clientId ?? "") == clientId)[0];

        clientData.position = q.findIndex(c => (c.clientId ?? "") == clientId);

        await this._client._redis.set(`queue:${queueIndex[clientId]}`, JSON.stringify(newQueue));

        if (!isKicked && databaseId)
            await this._client._redis.set(`recoveryData:${databaseId}`, JSON.stringify(clientData), {EX: this._client._config.redis.recoveryExpireTime});

        delete queueIndex[clientId];

        await this._client._redis.set(`queuedClients`, JSON.stringify(queueIndex));
        Utils.updateChannels();
    }
    
    static async isClientInQueue(clientId: string) {
        let queueIndex: { [key: string]: string; } = JSON.parse(await this._client._redis.get("queuedClients") ?? "[]");

        return Object.keys(queueIndex).includes(clientId);
    }

    static async getClientQueue(clientId: string) {
        let queueIndex: { [key: string]: string; } = JSON.parse(await this._client._redis.get("queuedClients") ?? "[]");

        let q: QueueMember[] = JSON.parse(await this._client._redis.get(`queue:${queueIndex[clientId]}`) ?? "[]");

        return q.filter(m => m.clientId == clientId)[0] ?? false;
    }

    static async getClientQueuePosition(clientId: string) {

        let queueIndex: { [key: string]: string; } = JSON.parse(await this._client._redis.get("queuedClients") ?? "[]");

        let q: QueueMember[] = JSON.parse(await this._client._redis.get(`queue:${queueIndex[clientId]}`) ?? "[]");

        return q.findIndex(c => (c.clientId ?? "") == clientId) + 1;
    }

    static async setClientQueuePosition(clientId: string, position: number, recoveryMode: boolean = false) { 
        let queueIndex: { [key: string]: string; } = JSON.parse(await this._client._redis.get("queuedClients") ?? "[]");

        let q: QueueMember[] = JSON.parse(await this._client._redis.get(`queue:${queueIndex[clientId]}`) ?? "[]");

        let queueEntry = q.filter(client => client.clientId == clientId)[0];

        if (recoveryMode) {
            queueEntry.comments = "[color=lime]*Recovered*[/color]";
        } else {
            queueEntry.comments = "[color=orange]*Moved by Staff*[/color]";
        }

        q.splice(position, 0, queueEntry);

        let uniqueQueue = Utils.getUniqueArray(q, 'clientId');

        await this._client._redis.set(`queue:${queueIndex[clientId]}`, JSON.stringify(uniqueQueue));
        await this._client._redis.set(`queuedClients`, JSON.stringify(queueIndex));

        Utils.updateChannels();

        this.notifyQueueOfPositionChange(queueIndex[clientId], recoveryMode ? 1 : 2);
    }

    static async getClientInQueuePosition(serverNum: any, position = 0) {
        let q: QueueMember[] = JSON.parse(await this._client._redis.get(`queue:${serverNum}`) ?? "[]");

        return q[position];
    }

    static async getQueue(serverNum: string)
    {
        let q: QueueMember[] = JSON.parse(await this._client._redis.get(`queue:${serverNum}`) ?? "[]");
 
        return q;
    }

    static async nukeQueue(serverNum: string) {
        let q: QueueMember[] = JSON.parse(await this._client._redis.get(`queue:${serverNum}`) ?? "[]");

        for await (const client of q) {
            this.removeClientFromQueue(client.clientId);
        }

        for await (const queueMember of q) {
            this._client.sendTextMessage(queueMember.clientId, 1, `[color=red]The queue has been nuked by an Administrator. You are no longer in queue and will need to rejoin.[/color]`);
        }
    }

    static async notifyQueueOfPositionChange(serverNum: string, notifyType: number = 0) {
        let q: QueueMember[] = JSON.parse(await this._client._redis.get(`server:${serverNum}`) ?? "[]");

        for (let i = 0; i < q.length; i++) {
            if (i == await this.getClientQueuePosition(q[i].clientId))
                continue;

            if (notifyType == 0) {
                this._client.sendTextMessage(q[i].clientId, 1, `[color=green][Queue Notification][/color] You are now [b]#${i + 1}[/b] in queue.`);
            } else if (notifyType == 1) {
                this._client.sendTextMessage(q[i].clientId, 1, `[color=green][Queue Notification][/color] You are now [b]#${i + 1}[/b] in queue. [i](Modified due to position recovery)[/i]`);
            } else if (notifyType == 2) {
                this._client.sendTextMessage(q[i].clientId, 1, `[color=green][Queue Notification][/color] You are now [b]#${i + 1}[/b] in queue. [i](Modified due to Staff adjusting positions)[/i]`);
            }
        }
    }

    static async isClientRecoverable(databaseId: string) {
        let recoveredClient = JSON.parse(await this._client._redis.get(`recoveryData:${databaseId}`) ?? "[]");

        if (recoveredClient == "") return false;

        return true;
    }

    static async recoverClient(databaseId: string) {
        let recoveredClient = JSON.parse(await this._client._redis.get(`recoveryData:${databaseId}`) ?? "[]");

        let newClient = await this._client.getClientByDbid(databaseId);

        await this.addClientToQueue(recoveredClient.clientNickname, newClient!.clid, recoveredClient.queue.queueName, true);
        await this.setClientQueuePosition(newClient!.clid, recoveredClient.position, true);

        let deleteData = await this._client._redis.del(`recoveryData:${databaseId}`);

        setTimeout(async function() {
            deleteData;
        }, 3000);
    }

    static async processQueue(client: Client, name: string, position: number = 0, message?: TextMessageEvent, ) {
        let first = await QueueHandler.getClientInQueuePosition(name, position);

        if (first) {
            let c = await client.getClientById(first.clientId) as TeamSpeakClient;

            if (!c || c == null)
                await QueueHandler.removeClientFromQueue(first.clientId);

            let channelsCleared = false;

            if (await Utils.channelsClear(client, client._config.botOptions.queuedChannels.filter(c => c.queueName == name)[0].freezeQueueChannels) !== 0) {
                if (message) {
                    channelsCleared = true;
                    Utils.sendMessage(message, `[color=green]Successfully forced Queue ${name.toUpperCase()} to move![/color]`);
                }
            } else {
                channelsCleared = true;

                if (message)
                    Utils.sendMessage(message, `[color=red][Error][/color] Unable to move the queue! This command is only to be used when users are in the freeze channels and need to be skipped over!`);
            }

            if (c && channelsCleared) {
                let channelId = (await client.getChannelById(c.cid))?.cid;
                if (!client._config.botOptions.skippedChannels.some(r => channelId == r)) {

                    let ch = await client.getChannelById(first.queue.channel) as TeamSpeakChannel;

                    if ((ch.totalClients < ch.maxclients) && await QueueHandler.isClientInQueue(c.clid)) {
                        if (this.processed[c.clid] && this.processed[c.clid] !== null && Math.round(Math.abs(new Date().getUTCMilliseconds() - (this.processed[c.clid] as Date).getUTCMilliseconds()) / 1000) <= 5) return;
                        this.processed[c.clid] = new Date();

                        client.clientPoke(c.clid, `You are about to be moved into [b]${ch.name}[/b]. Standby!`);

                        setTimeout(async () => {
                            let queueName = await QueueHandler.getClientQueueName(c.clid);
                            await QueueHandler.removeClientFromQueue(c.clid);
                            QueueHandler.notifyQueueOfPositionChange(queueName);

                            await c.move(first.queue.channel);
                            this.processed[c.clid] = null;

                        }, 5000);
                    }

                } else {
                    this.processQueue(client, name, position + 1);
                }
            } else {
                setTimeout(() => {
                    this.processQueue(client, name);
                }, 10000);
            }
        }
    }
}

export default QueueHandler;
export {
    QueueMember
}