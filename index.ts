import Client from "./classes/Client";
import Logger from "./classes/Logger";
import { config as conf } from "dotenv";
import config from "./config";

conf();

// @ts-ignore
new Client(config[process.env.ENV]);

process.on("uncaughtException", (err) => {
    Logger.run("error", err.message);
});

process.on("unhandledRejection", (err) => {
    Logger.run("error", err as string);
});