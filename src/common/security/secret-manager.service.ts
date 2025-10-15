/**
 * 密钥管理服务
 */

import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { SensitiveDataService } from './sensitive-data.service';
import { SecureFileService } from './secure-file.service';
import { LoggerService } from '../logger/logger.service';
import { BaseException } from '../exceptions/base.exception';
import { ERROR_CODES } from '../constants/error-codes';

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

@Injectable()
export class SecretManagerService {
  private secretsStore: Map<string, Secret> = new Map();
  private secretsFilePath: string;
  
  constructor(
    private readonly sensitiveData: SensitiveDataService,
    private readonly secureFile: SecureFileService,
    private readonly logger: LoggerService,
  ) {
    this.secretsFilePath = path.join(process.cwd(), '.secrets', 'secrets.encrypted');
    this.loadSecrets();
  }

  /**
   * 加载密钥
   */
  private async loadSecrets(): Promise<void> {
    try {
      if (await this.secureFile.exists(this.secretsFilePath)) {
        const encryptedData = await this.secureFile.readFile(this.secretsFilePath, 'utf8') as string;
        const decryptedData = this.sensitiveData.decrypt(encryptedData);
        const secrets = JSON.parse(decryptedData);
        
        for (const secret of secrets) {
          this.secretsStore.set(secret.id, {
            ...secret,
            createdAt: new Date(secret.createdAt),
            updatedAt: new Date(secret.updatedAt),
            expiresAt: secret.expiresAt ? new Date(secret.expiresAt) : undefined,
          });
        }
        
        this.logger.debug('加载密钥成功', { count: this.secretsStore.size });
      }
    } catch (error) {
      this.logger.error('加载密钥失败', { error: error.message });
    }
  }

  /**
   * 保存密钥
   */
  private async saveSecrets(): Promise<void> {
    try {
      const secrets = Array.from(this.secretsStore.values());
      const jsonData = JSON.stringify(secrets, null, 2);
      const encryptedData = this.sensitiveData.encrypt(jsonData);
      
      await this.secureFile.writeFile(this.secretsFilePath, encryptedData);
      
      this.logger.debug('保存密钥成功', { count: secrets.length });
    } catch (error) {
      this.logger.error('保存密钥失败', { error: error.message });
      throw new BaseException(
        ERROR_CODES.FS_WRITE_FAILED,
        { path: this.secretsFilePath, error: error.message }
      );
    }
  }

  /**
   * 创建密钥
   */
  async createSecret(
    name: string,
    value: string,
    options: {
      encrypt?: boolean;
      expiresIn?: number;
      metadata?: Record<string, any>;
    } = {},
  ): Promise<Secret> {
    const id = this.sensitiveData.generateSecureToken(16);
    
    const secret: Secret = {
      id,
      name,
      value: options.encrypt ? this.sensitiveData.encrypt(value) : value,
      encrypted: options.encrypt || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: options.metadata,
    };
    
    if (options.expiresIn) {
      secret.expiresAt = new Date(Date.now() + options.expiresIn);
    }
    
    this.secretsStore.set(id, secret);
    await this.saveSecrets();
    
    this.logger.info('创建密钥', { name, id });
    
    return { ...secret, value: '[HIDDEN]' };
  }

  /**
   * 获取密钥
   */
  getSecret(id: string): string | null {
    const secret = this.secretsStore.get(id);
    
    if (!secret) {
      return null;
    }
    
    // 检查是否过期
    if (secret.expiresAt && secret.expiresAt < new Date()) {
      this.logger.warn('密钥已过期', { id, name: secret.name });
      this.deleteSecret(id);
      return null;
    }
    
    // 解密值
    if (secret.encrypted) {
      try {
        return this.sensitiveData.decrypt(secret.value);
      } catch (error) {
        this.logger.error('解密密钥失败', { id, error: error.message });
        return null;
      }
    }
    
    return secret.value;
  }

  /**
   * 按名称获取密钥
   */
  getSecretByName(name: string): string | null {
    for (const secret of this.secretsStore.values()) {
      if (secret.name === name) {
        return this.getSecret(secret.id);
      }
    }
    
    return null;
  }

  /**
   * 更新密钥
   */
  async updateSecret(id: string, value: string): Promise<boolean> {
    const secret = this.secretsStore.get(id);
    
    if (!secret) {
      return false;
    }
    
    secret.value = secret.encrypted ? this.sensitiveData.encrypt(value) : value;
    secret.updatedAt = new Date();
    
    await this.saveSecrets();
    
    this.logger.info('更新密钥', { id, name: secret.name });
    
    return true;
  }

  /**
   * 删除密钥
   */
  async deleteSecret(id: string): Promise<boolean> {
    const secret = this.secretsStore.get(id);
    
    if (!secret) {
      return false;
    }
    
    this.secretsStore.delete(id);
    await this.saveSecrets();
    
    this.logger.info('删除密钥', { id, name: secret.name });
    
    return true;
  }

  /**
   * 列出所有密钥
   */
  listSecrets(): Array<Omit<Secret, 'value'>> {
    const secrets: Array<Omit<Secret, 'value'>> = [];
    
    for (const secret of this.secretsStore.values()) {
      // 检查是否过期
      if (secret.expiresAt && secret.expiresAt < new Date()) {
        continue;
      }
      
      const { value, ...secretInfo } = secret;
      secrets.push(secretInfo);
    }
    
    return secrets;
  }

  /**
   * 清理过期密钥
   */
  async cleanupExpiredSecrets(): Promise<number> {
    const now = new Date();
    const expiredIds: string[] = [];
    
    for (const [id, secret] of this.secretsStore.entries()) {
      if (secret.expiresAt && secret.expiresAt < now) {
        expiredIds.push(id);
      }
    }
    
    for (const id of expiredIds) {
      this.secretsStore.delete(id);
    }
    
    if (expiredIds.length > 0) {
      await this.saveSecrets();
      this.logger.info('清理过期密钥', { count: expiredIds.length });
    }
    
    return expiredIds.length;
  }

  /**
   * 轮转密钥
   */
  async rotateSecret(id: string): Promise<Secret | null> {
    const secret = this.secretsStore.get(id);
    
    if (!secret) {
      return null;
    }
    
    // 生成新值
    const newValue = this.sensitiveData.generateApiKey(secret.name);
    
    // 创建新密钥
    const newSecret = await this.createSecret(
      `${secret.name}_rotated`,
      newValue,
      {
        encrypt: secret.encrypted,
        metadata: {
          ...secret.metadata,
          rotatedFrom: id,
          rotatedAt: new Date(),
        },
      },
    );
    
    // 标记旧密钥为即将过期
    secret.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
    secret.metadata = {
      ...secret.metadata,
      rotatedTo: newSecret.id,
      rotatedAt: new Date(),
    };
    
    await this.saveSecrets();
    
    this.logger.info('轮转密钥', { oldId: id, newId: newSecret.id });
    
    return newSecret;
  }

  /**
   * 备份密钥
   */
  async backupSecrets(backupPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = backupPath || path.join(
      process.cwd(),
      '.secrets',
      'backups',
      `secrets_backup_${timestamp}.encrypted`,
    );
    
    await fs.ensureDir(path.dirname(backupFile));
    
    const secrets = Array.from(this.secretsStore.values());
    const jsonData = JSON.stringify(secrets, null, 2);
    const encryptedData = this.sensitiveData.encrypt(jsonData);
    
    await fs.writeFile(backupFile, encryptedData);
    
    this.logger.info('备份密钥', { file: backupFile, count: secrets.length });
    
    return backupFile;
  }

  /**
   * 恢复密钥
   */
  async restoreSecrets(backupPath: string): Promise<number> {
    try {
      const encryptedData = await fs.readFile(backupPath, 'utf8');
      const decryptedData = this.sensitiveData.decrypt(encryptedData);
      const secrets = JSON.parse(decryptedData);
      
      this.secretsStore.clear();
      
      for (const secret of secrets) {
        this.secretsStore.set(secret.id, {
          ...secret,
          createdAt: new Date(secret.createdAt),
          updatedAt: new Date(secret.updatedAt),
          expiresAt: secret.expiresAt ? new Date(secret.expiresAt) : undefined,
        });
      }
      
      await this.saveSecrets();
      
      this.logger.info('恢复密钥', { file: backupPath, count: secrets.length });
      
      return secrets.length;
    } catch (error) {
      this.logger.error('恢复密钥失败', { file: backupPath, error: error.message });
      throw new BaseException(
        ERROR_CODES.FS_READ_FAILED,
        { path: backupPath, error: error.message }
      );
    }
  }
}
