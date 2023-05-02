type ConnectionOptions = {
    host: string;
    queryport: number;
    serverport: number;
    username: string;
    password: string;
    nickname: string;
}

type RedisOptions = {
    connectionString: string;
    recoveryExpireTime: number;
}

type QueuedChannel = {
    queueName: string;
    parentChannel: string;
    channel: string;
    excludedSubChannels: string[];
    freezeQueueChannels: string[]
}

type BotOptions = {
    prefix: string;
    queueChannelID: string;
    afkChannelID: string;
    staffGroups: string[];
    adminGroups: string[];
    queuedChannels: QueuedChannel[];
    skippedChannels: string[];
}

type Config = {
    env: string;
    connectionOptions: ConnectionOptions;
    redis: RedisOptions;
    botOptions: BotOptions;
}

type ConfigImport = {
    [key: string]: Config
}

export {
    ConnectionOptions,
    RedisOptions,
    QueuedChannel,
    BotOptions,
    Config,
    ConfigImport
}