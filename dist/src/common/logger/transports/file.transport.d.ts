import { LogEntry } from '../logger.config';
export declare class FileTransport {
    private filePath;
    private maxFileSize;
    private maxFiles;
    private bufferSize;
    private flushInterval;
    private formatter;
    private logStream?;
    private currentFileSize;
    private currentFileIndex;
    private buffer;
    private flushTimer?;
    constructor(filePath: string, maxFileSize?: number, maxFiles?: number, bufferSize?: number, flushInterval?: number);
    private initializeFile;
    write(entry: LogEntry): void;
    writeBatch(entries: LogEntry[]): void;
    flush(): void;
    private rotate;
    private cleanOldFiles;
    private startFlushTimer;
    close(): void;
}
