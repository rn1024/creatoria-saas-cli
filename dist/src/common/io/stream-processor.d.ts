import { Transform } from 'stream';
export interface StreamOptions {
    encoding?: BufferEncoding;
    highWaterMark?: number;
    compression?: 'gzip' | 'deflate' | 'brotli';
}
export declare class StreamProcessor {
    private logger;
    processLineByLine(filePath: string, processor: (line: string, lineNumber: number) => Promise<void> | void, options?: StreamOptions): Promise<number>;
    streamCopy(source: string, destination: string, transformer?: Transform, options?: StreamOptions): Promise<void>;
    compressFile(source: string, destination?: string, type?: 'gzip' | 'deflate' | 'brotli'): Promise<string>;
    decompressFile(source: string, destination?: string, type?: 'gzip' | 'deflate' | 'brotli'): Promise<string>;
    createTransformStream(transformer: (chunk: string) => string | null): Transform;
    splitFile(filePath: string, maxSize: number, outputDir?: string): Promise<string[]>;
    mergeFiles(files: string[], destination: string): Promise<void>;
    searchInFile(filePath: string, pattern: RegExp | string, options?: {
        maxMatches?: number;
        context?: number;
    }): Promise<Array<{
        line: number;
        content: string;
        match: string;
    }>>;
    calculateHash(filePath: string, algorithm?: 'md5' | 'sha1' | 'sha256'): Promise<string>;
    tail(filePath: string, lines?: number, follow?: boolean): Promise<string[]>;
}
