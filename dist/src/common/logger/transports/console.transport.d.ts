import { LogEntry } from '../logger.config';
export declare class ConsoleTransport {
    private formatter;
    constructor(useColors?: boolean, useIcons?: boolean);
    write(entry: LogEntry): void;
    writeBatch(entries: LogEntry[]): void;
    flush(): void;
}
