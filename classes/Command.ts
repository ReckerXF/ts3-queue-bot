import { TextMessage } from "ts3-nodejs-library/lib/types/Events";
import { TextMessageTargetMode } from "ts3-nodejs-library";
import Client from "./Client";

type CommandConfig = {
    memberOnly?: boolean;
    staffOnly?: boolean;
    adminOnly?: boolean;
    strictTargetMode?: TextMessageTargetMode;
    antiFloodTime?: number | 1;
}

abstract class Command {
    abstract config: CommandConfig;

    abstract run(client: Client, message: TextMessage, args: string[]): Promise<void>;
}

export default Command;
export {
    CommandConfig
}