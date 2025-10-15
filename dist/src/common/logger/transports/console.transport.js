"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleTransport = void 0;
const logger_config_1 = require("../logger.config");
const cli_formatter_1 = require("../formatters/cli.formatter");
class ConsoleTransport {
    formatter;
    constructor(useColors = true, useIcons = true) {
        this.formatter = new cli_formatter_1.CliFormatter(useColors, useIcons);
    }
    write(entry) {
        const formatted = this.formatter.format(entry);
        if (entry.level >= logger_config_1.LogLevel.ERROR) {
            console.error(formatted);
        }
        else if (entry.level === logger_config_1.LogLevel.WARN) {
            console.warn(formatted);
        }
        else {
            console.log(formatted);
        }
    }
    writeBatch(entries) {
        entries.forEach(entry => this.write(entry));
    }
    flush() {
    }
}
exports.ConsoleTransport = ConsoleTransport;
//# sourceMappingURL=console.transport.js.map