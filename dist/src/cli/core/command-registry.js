"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = void 0;
const logger_service_1 = require("../../common/logger/logger.service");
class CommandRegistry {
    static instance;
    commands = new Map();
    logger = new logger_service_1.LoggerService('CommandRegistry');
    constructor() { }
    static getInstance() {
        if (!CommandRegistry.instance) {
            CommandRegistry.instance = new CommandRegistry();
        }
        return CommandRegistry.instance;
    }
    register(name, description, modulePath, className) {
        if (this.commands.has(name)) {
            this.logger.warn(`Command '${name}' already registered, overwriting`);
        }
        this.commands.set(name, {
            name,
            description,
            modulePath,
            className,
            loaded: false,
        });
        this.logger.debug(`Registered command: ${name}`, {
            metadata: { modulePath, className },
        });
    }
    registerInstance(name, description, instance) {
        this.commands.set(name, {
            name,
            description,
            instance,
            loaded: true,
            loadTime: 0,
        });
        this.logger.debug(`Registered command instance: ${name}`);
    }
    getCommand(name) {
        return this.commands.get(name);
    }
    getAllCommands() {
        return Array.from(this.commands.values());
    }
    getLoadedCommands() {
        return Array.from(this.commands.values()).filter(cmd => cmd.loaded);
    }
    updateInstance(name, instance, loadTime) {
        const command = this.commands.get(name);
        if (command) {
            command.instance = instance;
            command.loaded = true;
            command.loadTime = loadTime;
            this.logger.debug(`Loaded command: ${name}`, {
                metadata: { loadTime: `${loadTime}ms` },
            });
        }
    }
    clear() {
        this.commands.clear();
    }
    getStats() {
        const commands = Array.from(this.commands.values());
        const loaded = commands.filter(cmd => cmd.loaded);
        const totalLoadTime = loaded.reduce((sum, cmd) => sum + (cmd.loadTime || 0), 0);
        return {
            total: commands.length,
            loaded: loaded.length,
            totalLoadTime,
            averageLoadTime: loaded.length > 0 ? totalLoadTime / loaded.length : 0,
        };
    }
}
exports.CommandRegistry = CommandRegistry;
//# sourceMappingURL=command-registry.js.map