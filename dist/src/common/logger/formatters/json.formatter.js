"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonFormatter = void 0;
const logger_config_1 = require("../logger.config");
class JsonFormatter {
    format(entry) {
        const formatted = {
            timestamp: entry.timestamp.toISOString(),
            level: (0, logger_config_1.getLogLevelName)(entry.level),
            message: entry.message,
        };
        if (entry.context) {
            formatted.context = entry.context;
        }
        if (entry.tags && entry.tags.length > 0) {
            formatted.tags = entry.tags;
        }
        if (entry.error) {
            formatted.error = {
                name: entry.error.name,
                message: entry.error.message,
                stack: entry.error.stack,
            };
        }
        return JSON.stringify(formatted);
    }
    formatBatch(entries) {
        return entries.map(entry => this.format(entry)).join('\n');
    }
}
exports.JsonFormatter = JsonFormatter;
//# sourceMappingURL=json.formatter.js.map