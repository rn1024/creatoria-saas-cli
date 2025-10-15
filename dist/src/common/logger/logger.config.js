"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLoggerConfig = exports.LogLevel = void 0;
exports.getLogLevelName = getLogLevelName;
exports.parseLogLevel = parseLogLevel;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
    LogLevel[LogLevel["OFF"] = 5] = "OFF";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
exports.defaultLoggerConfig = {
    level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    colors: process.env.NODE_ENV !== 'production',
    timestamp: true,
    context: true,
    json: process.env.NODE_ENV === 'production',
    console: true,
    file: process.env.NODE_ENV === 'production',
    filePath: 'logs/creatoria.log',
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 5,
};
function getLogLevelName(level) {
    switch (level) {
        case LogLevel.DEBUG:
            return 'DEBUG';
        case LogLevel.INFO:
            return 'INFO';
        case LogLevel.WARN:
            return 'WARN';
        case LogLevel.ERROR:
            return 'ERROR';
        case LogLevel.FATAL:
            return 'FATAL';
        default:
            return 'UNKNOWN';
    }
}
function parseLogLevel(level) {
    switch (level.toUpperCase()) {
        case 'DEBUG':
            return LogLevel.DEBUG;
        case 'INFO':
            return LogLevel.INFO;
        case 'WARN':
        case 'WARNING':
            return LogLevel.WARN;
        case 'ERROR':
            return LogLevel.ERROR;
        case 'FATAL':
            return LogLevel.FATAL;
        case 'OFF':
            return LogLevel.OFF;
        default:
            return LogLevel.INFO;
    }
}
//# sourceMappingURL=logger.config.js.map