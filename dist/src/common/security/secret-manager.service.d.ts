import { SensitiveDataService } from './sensitive-data.service';
import { SecureFileService } from './secure-file.service';
import { LoggerService } from '../logger/logger.service';
export interface Secret {
    id: string;
    name: string;
    value: string;
    encrypted: boolean;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    metadata?: Record<string, any>;
}
export declare class SecretManagerService {
    private readonly sensitiveData;
    private readonly secureFile;
    private readonly logger;
    private secretsStore;
    private secretsFilePath;
    constructor(sensitiveData: SensitiveDataService, secureFile: SecureFileService, logger: LoggerService);
    private loadSecrets;
    private saveSecrets;
    createSecret(name: string, value: string, options?: {
        encrypt?: boolean;
        expiresIn?: number;
        metadata?: Record<string, any>;
    }): Promise<Secret>;
    getSecret(id: string): string | null;
    getSecretByName(name: string): string | null;
    updateSecret(id: string, value: string): Promise<boolean>;
    deleteSecret(id: string): Promise<boolean>;
    listSecrets(): Array<Omit<Secret, 'value'>>;
    cleanupExpiredSecrets(): Promise<number>;
    rotateSecret(id: string): Promise<Secret | null>;
    backupSecrets(backupPath?: string): Promise<string>;
    restoreSecrets(backupPath: string): Promise<number>;
}
