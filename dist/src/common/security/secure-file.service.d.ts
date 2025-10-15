import * as fs from 'fs-extra';
import { PathSecurityService } from './path-security.service';
import { LoggerService } from '../logger/logger.service';
export declare class SecureFileService {
    private readonly pathSecurity;
    private readonly logger;
    constructor(pathSecurity: PathSecurityService, logger: LoggerService);
    readFile(filePath: string, encoding?: BufferEncoding): Promise<string | Buffer>;
    writeFile(filePath: string, data: string | Buffer, options?: fs.WriteFileOptions): Promise<void>;
    deleteFile(filePath: string): Promise<void>;
    copyFile(srcPath: string, destPath: string): Promise<void>;
    moveFile(srcPath: string, destPath: string): Promise<void>;
    createDirectory(dirPath: string): Promise<void>;
    deleteDirectory(dirPath: string): Promise<void>;
    readDirectory(dirPath: string): Promise<string[]>;
    exists(filePath: string): Promise<boolean>;
    getStats(filePath: string): Promise<fs.Stats>;
    createTempFile(prefix?: string, extension?: string): Promise<string>;
    createTempDirectory(prefix?: string): Promise<string>;
    cleanupTempFiles(olderThanMs?: number): Promise<void>;
}
