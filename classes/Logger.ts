import moment from "moment";
import winston from "winston";

class Logger {
    static levels: any;
    static level: any;
    static colors: any;
    static format: any;
    static transports: any;

    private static init() {
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        }

        this.level = () => {
            var env = process.env.NODE_ENV || "develop";
            var isDevelop = env === "develop";
            return isDevelop ? "debug" : "info";
        }

        this.colors = {
            error: "red",
            warn: "yellow",
            info: "white",
            debug: "blue"
        }

        winston.addColors(this.colors);

        this.format = winston.format.combine(
            winston.format.timestamp({format: "MM/DD/YYYY HH:mm:ss"}),
            winston.format.printf(info => `[${info.timestamp}] [${info.level}] ${info.message}`)
        )

        this.transports = [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize({ all: true }))
            }),
            new winston.transports.File({filename: `logs/${moment().format("MM-DD-YY")}--ERROR.log`, level: "error"}),
            new winston.transports.File({filename: `logs/${moment().format("MM-DD-YY")}.log`}),
        ]
    }

    public static run(level: string, message: any) {
        this.init();

        let winstonLogger = winston.createLogger({
            level: this.level(),
            levels: this.levels,
            format: this.format,
            transports: this.transports,

        })

        return winstonLogger.log(level, message);
    }
}

export default Logger;