"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyModuleAddCommand = void 0;
const lazy_command_decorator_1 = require("../decorators/lazy-command.decorator");
const module_add_command_1 = require("./module-add.command");
const command_registry_1 = require("../core/command-registry");
const registry = command_registry_1.CommandRegistry.getInstance();
registry.register('module-add', 'Add a module to the project', '../commands/module-add.command', 'ModuleAddCommand');
let LazyModuleAddCommand = class LazyModuleAddCommand extends module_add_command_1.ModuleAddCommand {
    async run(args, options) {
        return super.run(args, options);
    }
};
exports.LazyModuleAddCommand = LazyModuleAddCommand;
__decorate([
    (0, lazy_command_decorator_1.CommandHandler)({
        validateArgs: true,
        logExecution: true,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], LazyModuleAddCommand.prototype, "run", null);
exports.LazyModuleAddCommand = LazyModuleAddCommand = __decorate([
    (0, lazy_command_decorator_1.LazyCommand)({
        name: 'module-add-lazy',
        description: 'Add a module to the project (lazy loaded)',
        preload: false,
        priority: 10,
    })
], LazyModuleAddCommand);
//# sourceMappingURL=lazy-module-add.command.js.map