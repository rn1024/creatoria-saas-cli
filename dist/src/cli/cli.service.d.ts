import { ModuleCommand } from './commands/module.command';
import { ModuleAddCommand } from './commands/module-add.command';
import { DatabaseCommand } from './commands/database.command';
import { ConfigCommand } from './commands/config.command';
import { CreateCommand } from './commands/create.command';
import { InitCommand } from './commands/init.command';
import { ServerCommand } from './commands/server.command';
import { DockerCommand } from './commands/docker.command';
export declare class CliService {
    private moduleCommand;
    private moduleAddCommand;
    private databaseCommand;
    private configCommand;
    private createCommand;
    private initCommand;
    private serverCommand;
    private dockerCommand;
    private program;
    constructor(moduleCommand: ModuleCommand, moduleAddCommand: ModuleAddCommand, databaseCommand: DatabaseCommand, configCommand: ConfigCommand, createCommand: CreateCommand, initCommand: InitCommand, serverCommand: ServerCommand, dockerCommand: DockerCommand);
    private setupCommands;
    run(): Promise<void>;
}
