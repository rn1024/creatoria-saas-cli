import { Module } from '@nestjs/common';
import { CliService } from './cli.service';
import { ModuleCommand } from './commands/module.command';
import { ModuleAddCommand } from './commands/module-add.command';
import { DatabaseCommand } from './commands/database.command';
import { ConfigCommand } from './commands/config.command';
import { CreateCommand } from './commands/create.command';
import { InitCommand } from './commands/init.command';
import { ServerCommand } from './commands/server.command';
import { DockerCommand } from './commands/docker.command';
import { DevCommand } from './commands/dev.command';
import { ConfigModule } from '../config/config.module';
import { DependencyManagerService } from './services/dependency-manager.service';
import { HotReloadService } from './services/hot-reload.service';
import { DynamicModuleLoaderService } from './services/dynamic-module-loader.service';

@Module({
  imports: [ConfigModule],
  providers: [
    CliService,
    ModuleCommand,
    ModuleAddCommand,
    DatabaseCommand,
    ConfigCommand,
    CreateCommand,
    InitCommand,
    ServerCommand,
    DockerCommand,
    DevCommand,
    DependencyManagerService,
    HotReloadService,
    DynamicModuleLoaderService,
  ],
  exports: [CliService],
})
export class CliModule {}
