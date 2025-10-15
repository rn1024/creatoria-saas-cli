"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
exports.Performance = Performance;
exports.CacheLog = CacheLog;
exports.Audit = Audit;
const logger_service_1 = require("../logger/logger.service");
function Log(options) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        descriptor.value = async function (...args) {
            const logger = new logger_service_1.LoggerService(className);
            const context = {
                module: className,
                method: propertyKey,
            };
            const message = options?.message || `Calling ${propertyKey}`;
            if (options?.logArgs) {
                context.metadata = { arguments: args };
            }
            logger.debug(message, context);
            const start = Date.now();
            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - start;
                const successContext = { ...context };
                if (options?.logDuration) {
                    successContext.duration = duration;
                }
                if (options?.logResult) {
                    successContext.metadata = {
                        ...successContext.metadata,
                        result: result,
                    };
                }
                logger.debug(`${propertyKey} completed`, successContext);
                return result;
            }
            catch (error) {
                const duration = Date.now() - start;
                logger.error(`${propertyKey} failed`, error, { ...context, duration });
                throw error;
            }
        };
        return descriptor;
    };
}
function Performance(threshold = 1000) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        descriptor.value = async function (...args) {
            const logger = new logger_service_1.LoggerService(className);
            const start = Date.now();
            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - start;
                if (duration > threshold) {
                    logger.warn(`Slow operation: ${propertyKey}`, {
                        module: className,
                        method: propertyKey,
                        duration,
                        metadata: { threshold },
                    });
                }
                return result;
            }
            catch (error) {
                const duration = Date.now() - start;
                logger.error(`${propertyKey} failed`, error, {
                    module: className,
                    method: propertyKey,
                    duration,
                });
                throw error;
            }
        };
        return descriptor;
    };
}
function CacheLog() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const cache = new Map();
        descriptor.value = async function (...args) {
            const logger = new logger_service_1.LoggerService(className);
            const cacheKey = JSON.stringify(args);
            if (cache.has(cacheKey)) {
                logger.debug(`Cache hit: ${propertyKey}`, {
                    module: className,
                    method: propertyKey,
                    metadata: { cacheKey },
                });
                return cache.get(cacheKey);
            }
            logger.debug(`Cache miss: ${propertyKey}`, {
                module: className,
                method: propertyKey,
                metadata: { cacheKey },
            });
            try {
                const result = await originalMethod.apply(this, args);
                cache.set(cacheKey, result);
                return result;
            }
            catch (error) {
                logger.error(`${propertyKey} failed`, error, {
                    module: className,
                    method: propertyKey,
                });
                throw error;
            }
        };
        return descriptor;
    };
}
function Audit(action) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        descriptor.value = async function (...args) {
            const logger = new logger_service_1.LoggerService('AUDIT');
            logger.info(`Action: ${action}`, {
                module: className,
                method: propertyKey,
                metadata: {
                    timestamp: new Date().toISOString(),
                    action,
                    arguments: args,
                },
            });
            try {
                const result = await originalMethod.apply(this, args);
                logger.info(`Action completed: ${action}`, {
                    module: className,
                    method: propertyKey,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        action,
                        success: true,
                    },
                });
                return result;
            }
            catch (error) {
                logger.error(`Action failed: ${action}`, error, {
                    module: className,
                    method: propertyKey,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        action,
                        success: false,
                    },
                });
                throw error;
            }
        };
        return descriptor;
    };
}
//# sourceMappingURL=logger.decorator.js.map