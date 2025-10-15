"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const system_service_1 = require("./system.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const common_2 = require("../common");
const systemPrefix = process.env.SYSTEM_PREFIX || 'test-system';
let SystemController = class SystemController {
    systemService;
    constructor(systemService) {
        this.systemService = systemService;
    }
    async getSystemInfo() {
        return this.systemService.getSystemInfo();
    }
    async healthCheck() {
        return this.systemService.healthCheck();
    }
    async getAllConfigs() {
        return this.systemService.getAllConfigs();
    }
    async getConfig(key) {
        const value = await this.systemService.getConfig(key);
        return { key, value };
    }
    async setConfig(body) {
        return this.systemService.setConfig(body.key, body.value, body.description);
    }
    async getLogs(query) {
        return this.systemService.getLogs(query);
    }
    async log(body) {
        return this.systemService.log(body);
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, common_1.Get)('info'),
    (0, common_2.Public)(),
    (0, swagger_1.ApiOperation)({ summary: '获取系统信息' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getSystemInfo", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_2.Public)(),
    (0, swagger_1.ApiOperation)({ summary: '健康检查' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取所有配置' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getAllConfigs", null);
__decorate([
    (0, common_1.Get)('config/:key'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取指定配置' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '设置配置' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "setConfig", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取系统日志' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Post)('logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '记录系统日志' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "log", null);
exports.SystemController = SystemController = __decorate([
    (0, swagger_1.ApiTags)('System'),
    (0, common_1.Controller)(systemPrefix),
    __metadata("design:paramtypes", [system_service_1.SystemService])
], SystemController);
//# sourceMappingURL=system.controller.js.map