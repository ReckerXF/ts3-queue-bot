import Client from "../classes/Client";
import Command from "../classes/Command";
import Logger from "../classes/Logger";

class CommandHandler {
    private static _commands: Map<string, Command> = new Map();

    public static RegisterCommand(name: string, command: Command): void {
        Logger.run("info", `Registered command: ${name}`);

        this._commands.set(name.toLowerCase(), command);
    }

    public static getCommands(): Map<string, Command> {
        return this._commands;
    }

    public static getCommand(name: string): Command | null {
        let cmd = this._commands.get(name);

        if (cmd) return cmd;
        else return null;
    }
}

export default CommandHandler;