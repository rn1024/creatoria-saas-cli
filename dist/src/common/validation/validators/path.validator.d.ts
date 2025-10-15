export declare class PathValidator {
    static isAbsolute(value: string): boolean;
    static isRelative(value: string): boolean;
    static exists(value: string): Promise<boolean>;
    static existsSync(value: string): boolean;
    static isFile(value: string): Promise<boolean>;
    static isDirectory(value: string): Promise<boolean>;
    static hasExtension(value: string, extensions: string | string[]): boolean;
    static hasPathTraversal(value: string): boolean;
    static isSafePath(value: string, basePath?: string): boolean;
    static isValidFileName(value: string): boolean;
    static sanitize(value: string): string;
    static normalize(value: string): string;
    static getSafeRelativePath(from: string, to: string): string | null;
    static hasPermission(value: string, mode: number): Promise<boolean>;
    static isReadable(value: string): Promise<boolean>;
    static isWritable(value: string): Promise<boolean>;
    static isExecutable(value: string): Promise<boolean>;
}
