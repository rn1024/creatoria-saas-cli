import { LogEntry } from '../logger.config';
export declare class JsonFormatter {
    format(entry: LogEntry): string;
    formatBatch(entries: LogEntry[]): string;
}
