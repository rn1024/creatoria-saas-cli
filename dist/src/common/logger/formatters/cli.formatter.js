"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliFormatter = void 0;
const logger_config_1 = require("../logger.config");
const chalk = require('chalk');
class CliFormatter {
    useColors;
    useIcons;
    colors = {
        [logger_config_1.LogLevel.DEBUG]: chalk.gray,
        [logger_config_1.LogLevel.INFO]: chalk.blue,
        [logger_config_1.LogLevel.WARN]: chalk.yellow,
        [logger_config_1.LogLevel.ERROR]: chalk.red,
        [logger_config_1.LogLevel.FATAL]: chalk.bgRed.white,
    };
    icons = {
        [logger_config_1.LogLevel.DEBUG]: '🔍',
        [logger_config_1.LogLevel.INFO]: 'ℹ️',
        [logger_config_1.LogLevel.WARN]: '⚠️',
        [logger_config_1.LogLevel.ERROR]: '❌',
        [logger_config_1.LogLevel.FATAL]: '💀',
    };
    constructor(useColors = true, useIcons = true) {
        this.useColors = useColors;
        this.useIcons = useIcons;
    }
    format(entry) {
        const parts = [];
        const timestamp = this.formatTimestamp(entry.timestamp);
        if (timestamp) {
            parts.push(this.useColors ? chalk.gray(timestamp) : timestamp);
        }
        const level = this.formatLevel(entry.level);
        parts.push(level);
        if (entry.context) {
            const context = this.formatContext(entry.context);
            if (context) {
                parts.push(this.useColors ? chalk.cyan(context) : context);
            }
        }
        parts.push(this.formatMessage(entry.message, entry.level));
        if (entry.tags && entry.tags.length > 0) {
            const tags = entry.tags.map(tag => `#${tag}`).join(' ');
            parts.push(this.useColors ? chalk.magenta(tags) : tags);
        }
        let result = parts.join(' ');
        if (entry.error) {
            result += '\n' + this.formatError(entry.error);
        }
        return result;
    }
    formatTimestamp(timestamp) {
        const hours = timestamp.getHours().toString().padStart(2, '0');
        const minutes = timestamp.getMinutes().toString().padStart(2, '0');
        const seconds = timestamp.getSeconds().toString().padStart(2, '0');
        const ms = timestamp.getMilliseconds().toString().padStart(3, '0');
        return `[${hours}:${minutes}:${seconds}.${ms}]`;
    }
    formatLevel(level) {
        const levelName = (0, logger_config_1.getLogLevelName)(level).padEnd(5);
        const icon = this.useIcons ? this.icons[level] + ' ' : '';
        if (this.useColors) {
            const colorFn = this.colors[level];
            return icon + colorFn(levelName);
        }
        return icon + levelName;
    }
    formatContext(context) {
        const parts = [];
        if (context.module) {
            parts.push(context.module);
        }
        if (context.method) {
            parts.push(context.method);
        }
        if (parts.length === 0 && context.metadata) {
            if (context.metadata.command) {
                parts.push(context.metadata.command);
            }
        }
        return parts.length > 0 ? `[${parts.join('.')}]` : '';
    }
    formatMessage(message, level) {
        if (!this.useColors) {
            return message;
        }
        const colorFn = this.colors[level];
        return colorFn ? colorFn(message) : message;
    }
    formatError(error) {
        const lines = [];
        const errorHeader = `  ${error.name}: ${error.message}`;
        lines.push(this.useColors ? chalk.red(errorHeader) : errorHeader);
        if (process.env.NODE_ENV !== 'production' && error.stack) {
            const stackLines = error.stack.split('\n').slice(1, 4);
            stackLines.forEach(line => {
                const trimmed = line.trim();
                lines.push(this.useColors ? chalk.gray(`  ${trimmed}`) : `  ${trimmed}`);
            });
        }
        return lines.join('\n');
    }
}
exports.CliFormatter = CliFormatter;
//# sourceMappingURL=cli.formatter.js.map