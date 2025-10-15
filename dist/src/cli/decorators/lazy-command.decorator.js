"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAZY_COMMAND_METADATA = void 0;
exports.LazyCommand = LazyCommand;
exports.getPreloadList = getPreloadList;
exports.CommandHandler = CommandHandler;
exports.CommandParam = CommandParam;
const command_registry_1 = require("../core/command-registry");
const common_1 = require("@nestjs/common");
exports.LAZY_COMMAND_METADATA = 'lazy_command';
function LazyCommand(options) {
    return (target) => {
        (0, common_1.SetMetadata)(exports.LAZY_COMMAND_METADATA, options)(target);
        const modulePath = getModulePath(target);
        const className = target.name;
        const registry = command_registry_1.CommandRegistry.getInstance();
        registry.register(options.name, options.description, modulePath, className);
        if (options.preload) {
            addToPreloadList(options.name, options.priority || 100);
        }
        return target;
    };
}
function getModulePath(target) {
    const className = target.name;
    const fileName = className
        .replace(/Command$/, '')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .substring(1) + '.command';
    return `../commands/${fileName}`;
}
const preloadList = [];
function addToPreloadList(name, priority) {
    preloadList.push({ name, priority });
    preloadList.sort((a, b) => a.priority - b.priority);
}
function getPreloadList() {
    return preloadList.map(item => item.name);
}
function CommandHandler(options) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const commandName = this.constructor.name;
            if (options?.logExecution) {
                console.log(`Executing command: ${commandName}.${String(propertyKey)}`);
            }
            if (options?.validateArgs) {
                if (!args || args.length === 0) {
                    throw new Error('Command requires arguments');
                }
            }
            try {
                const result = await originalMethod.apply(this, args);
                return result;
            }
            catch (error) {
                console.error(`Command execution failed: ${commandName}.${String(propertyKey)}`);
                throw error;
            }
        };
        return descriptor;
    };
}
function CommandParam(name, options) {
    return (target, propertyKey, parameterIndex) => {
        const existingParams = Reflect.getMetadata('command_params', target, propertyKey) || [];
        existingParams[parameterIndex] = {
            name,
            index: parameterIndex,
            ...options,
        };
        Reflect.defineMetadata('command_params', existingParams, target, propertyKey);
    };
}
//# sourceMappingURL=lazy-command.decorator.js.map