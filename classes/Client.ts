// Packages
import { TeamSpeak } from "ts3-nodejs-library";
import { createClient, RedisClientType } from "redis";
import { readdirSync } from "fs";
import { join } from "path";

// Imports
import { Config } from "../types/Config.type";
import Command from "./Command";
import EventHandler from "../handlers/EventHandler";
import CommandHandler from "../handlers/CommandHandler";
import QueueHandler from "../handlers/QueueHandler";
import Utils from "./Utils";
import Logger from "./Logger";

class Client extends TeamSpeak {
    public _config: Config;

    public _redis: RedisClientType;

    private _commands: Map<string, Command>;

    constructor(config: Config) {
        super(config.connectionOptions);

        this._config = config;
        this._commands = new Map();

        this._redis = createClient({url: config.redis.connectionString});
        
        this.init();
    }

    private async init() {
        QueueHandler.init(this);
        Utils.init(this);
        await this._redis.connect();

        {
            if (!this._redis.exists("queuedClients") || this._config.env == "dev")
                this._redis.set("queuedClients", JSON.stringify({}));

            let serverChannels = this._config.botOptions.queuedChannels.map(c => `server:${c.queueName}`);
            for (let serverChannel of serverChannels) {
                if (!this._redis.exists(serverChannel) || this._config.env == "dev")
                    this._redis.set(serverChannel, JSON.stringify([]));
            }
        }

        // Load events
        {
            EventHandler.init(this);

            for (let file of readdirSync(join(__dirname, "../events"))) {
                require(join(__dirname, "../events", file));
            }
        }

        // Load commands
        {
            for (let file of readdirSync(join(__dirname, "../commands"))) {
                require(join(__dirname, "../commands", file));
            }

            this._commands = CommandHandler.getCommands();
        }
    }

    public getCommand(name: string): Command | undefined {
        return this._commands.get(name.toLowerCase());
    }

    public reloadCommand(name: string): boolean {
        try {
            delete require.cache[require.resolve(join(__dirname, "../commands", name + ".js"))];
            require(join(__dirname, "../commands", name + ".js"));

            let cmd = CommandHandler.getCommand(name);

            if (cmd) this._commands.set(name, cmd);
            else return false;

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

export default Client;