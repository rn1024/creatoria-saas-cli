/**
 * 安全模块
 */

import { Module, Global } from '@nestjs/common';
import { PathSecurityService } from './path-security.service';
import { SecureFileService } from './secure-file.service';
import { PathSecurityMiddleware } from './path-security.middleware';
import { CommandSecurityService } from './command-security.service';
import { SecureCommandExecutor } from './secure-command.executor';
import { SensitiveDataService } from './sensitive-data.service';
import { SecretManagerService } from './secret-manager.service';
import { DataMaskingService } from './data-masking.service';
import { LoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [
    PathSecurityService,
    SecureFileService,
    PathSecurityMiddleware,
    CommandSecurityService,
    SecureCommandExecutor,
    SensitiveDataService,
    SecretManagerService,
    DataMaskingService,
  ],
  exports: [
    PathSecurityService,
    SecureFileService,
    CommandSecurityService,
    SecureCommandExecutor,
    SensitiveDataService,
    SecretManagerService,
    DataMaskingService,
  ],
})
export class SecurityModule {}
