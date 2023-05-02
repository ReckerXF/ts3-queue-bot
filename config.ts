import { ConfigImport } from "./types/Config.type";

const Config: ConfigImport = {
    production: {
        env: "production",
        connectionOptions: {
            host: "ipaddress",
            queryport: 10011,
            serverport: 9970,
            username: "queryusername",
            password: "querypass",
            nickname: "Queue Bot",
        },
        redis: {
            connectionString: "redis://default:P@55w0rd@database:port",
            recoveryExpireTime: 300
        },
        botOptions: {
            prefix: "!",
            queuedChannels: [
                {
                    queueName: "1",
                    parentChannel: "1614", // The direct parent of the channel users are queuing for.
                    channel: "12510", // The channel the users will be queueing for.
                    excludedSubChannels: ["1613", "1619", "2111", "11501", "23933"], // Subchannels the bot will not look into when seeing if the channel is able to be joined.
                    freezeQueueChannels: [ // Channels that will hold up the queue if there are people in them. (NOT the queued channel)
                        "Channel 3",
                        "Channel 4"
                    ]
                }
            ],
            queueChannelID: "25919", // The channel users must join to enter commands.
            afkChannelID: "2083", // AFK channel
            staffGroups: [
                "1419",
                "1420",
                "1422"
            ],
            adminGroups: [
                "1431",
                "1421",
                "1422",
                "1423"
            ],
            skippedChannels: [ // Channels the bot will ignore people being in and move the queue as normal. (i.e. if someone in queue is in one of these channels they'll be skipped over)
                "Channel 1",
                "Channel 2"
            ]
        }
    },
    dev: {
        env: "dev",
        connectionOptions: {
            host: "ipaddress",
            queryport: 10011,
            serverport: 9970,
            username: "queryusername",
            password: "querypass",
            nickname: "Queue Bot",
        },
        redis: {
            connectionString: "redis://default:P@55w0rd@database:port",
            recoveryExpireTime: 300
        },
        botOptions: {
            prefix: "!",
            queuedChannels: [
                {
                    queueName: "1",
                    parentChannel: "1614", // The direct parent of the channel users are queuing for.
                    channel: "12510", // The channel the users will be queueing for.
                    excludedSubChannels: ["1613", "1619", "2111", "11501", "23933"], // Subchannels the bot will not look into when seeing if the channel is able to be joined.
                    freezeQueueChannels: [ // Channels that will hold up the queue if there are people in them. (NOT the queued channel)
                        "Channel 3",
                        "Channel 4"
                    ]
                }
            ],
            queueChannelID: "3479", // The channel users must join to enter commands.
            afkChannelID: "3478", // AFK channel
            staffGroups: [
                "2590",
                "2484",
                "2593"   
            ],
            adminGroups: [
                "2592",
                "2593",
                "2594",
                "2602"
            ],
            skippedChannels: [ // Channels the bot will ignore people being in and move the queue as normal. (i.e. if someone in queue is in one of these channels they'll be skipped over)
                "Channel 1",
                "Channel 2"
            ],
        }
    }
}

export default Config;