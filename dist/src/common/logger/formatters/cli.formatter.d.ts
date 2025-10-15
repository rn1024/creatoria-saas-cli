import { LogEntry } from '../logger.config';
export declare class CliFormatter {
    private useColors;
    private useIcons;
    private colors;
    private icons;
    constructor(useColors?: boolean, useIcons?: boolean);
    format(entry: LogEntry): string;
    private formatTimestamp;
    private formatLevel;
    private formatContext;
    private formatMessage;
    private formatError;
}
