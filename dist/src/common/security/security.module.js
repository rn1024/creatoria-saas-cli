"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const path_security_service_1 = require("./path-security.service");
const secure_file_service_1 = require("./secure-file.service");
const path_security_middleware_1 = require("./path-security.middleware");
const command_security_service_1 = require("./command-security.service");
const secure_command_executor_1 = require("./secure-command.executor");
const sensitive_data_service_1 = require("./sensitive-data.service");
const secret_manager_service_1 = require("./secret-manager.service");
const data_masking_service_1 = require("./data-masking.service");
const logger_module_1 = require("../logger/logger.module");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [logger_module_1.LoggerModule],
        providers: [
            path_security_service_1.PathSecurityService,
            secure_file_service_1.SecureFileService,
            path_security_middleware_1.PathSecurityMiddleware,
            command_security_service_1.CommandSecurityService,
            secure_command_executor_1.SecureCommandExecutor,
            sensitive_data_service_1.SensitiveDataService,
            secret_manager_service_1.SecretManagerService,
            data_masking_service_1.DataMaskingService,
        ],
        exports: [
            path_security_service_1.PathSecurityService,
            secure_file_service_1.SecureFileService,
            command_security_service_1.CommandSecurityService,
            secure_command_executor_1.SecureCommandExecutor,
            sensitive_data_service_1.SensitiveDataService,
            secret_manager_service_1.SecretManagerService,
            data_masking_service_1.DataMaskingService,
        ],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map