import { LoggerService } from '../logger/logger.service';
export declare class PathSecurityService {
    private readonly logger;
    private projectRoot;
    private allowedPaths;
    private blockedPaths;
    constructor(logger: LoggerService);
    private initializeSecurityRules;
    validatePath(inputPath: string, options?: {
        allowAbsolute?: boolean;
        basePath?: string;
        checkExists?: boolean;
        allowSymlinks?: boolean;
    }): string;
    private decodePathSafely;
    private isPathAllowed;
    private isSymlinkSync;
    createSafeTempPath(prefix?: string): string;
    getSafeRelativePath(from: string, to: string): string;
    validateFileName(fileName: string): void;
    addAllowedPath(dirPath: string): void;
    addBlockedPath(dirPath: string): void;
    getSecurityConfig(): {
        projectRoot: string;
        allowedPaths: string[];
        blockedPaths: string[];
    };
}
