"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliModule = void 0;
const common_1 = require("@nestjs/common");
const cli_service_1 = require("./cli.service");
const module_command_1 = require("./commands/module.command");
const module_add_command_1 = require("./commands/module-add.command");
const database_command_1 = require("./commands/database.command");
const config_command_1 = require("./commands/config.command");
const create_command_1 = require("./commands/create.command");
const init_command_1 = require("./commands/init.command");
const server_command_1 = require("./commands/server.command");
const docker_command_1 = require("./commands/docker.command");
const config_module_1 = require("../config/config.module");
const dependency_manager_service_1 = require("./services/dependency-manager.service");
let CliModule = class CliModule {
};
exports.CliModule = CliModule;
exports.CliModule = CliModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule],
        providers: [
            cli_service_1.CliService,
            module_command_1.ModuleCommand,
            module_add_command_1.ModuleAddCommand,
            database_command_1.DatabaseCommand,
            config_command_1.ConfigCommand,
            create_command_1.CreateCommand,
            init_command_1.InitCommand,
            server_command_1.ServerCommand,
            docker_command_1.DockerCommand,
            dependency_manager_service_1.DependencyManagerService,
        ],
        exports: [cli_service_1.CliService],
    })
], CliModule);
//# sourceMappingURL=cli.module.js.map