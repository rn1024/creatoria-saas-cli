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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_business_service_1 = require("./auth-business.service");
const auth_dto_1 = require("./dto/auth.dto");
const common_2 = require("@app/common");
const auth_1 = require("@app/auth");
const adminPrefix = process.env.ADMIN_PREFIX || 'test-admin';
const systemPrefix = process.env.SYSTEM_PREFIX || 'test-system';
const controllerPath = `/${adminPrefix}/${systemPrefix}/auth`;
let AuthController = class AuthController {
    authBusinessService;
    constructor(authBusinessService) {
        this.authBusinessService = authBusinessService;
    }
    async login(loginReqVO, req) {
        const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
        const result = await this.authBusinessService.login(loginReqVO, clientIP);
        return common_2.CommonResult.success(result);
    }
    async logout(req) {
        const userId = req.user?.userId;
        if (userId) {
            await this.authBusinessService.logout(userId);
        }
        return common_2.CommonResult.success(true);
    }
    async refreshToken(refreshToken) {
        const result = await this.authBusinessService.refreshToken(refreshToken);
        return common_2.CommonResult.success(result);
    }
    async getPermissionInfo(req) {
        const userId = req.user?.userId;
        const result = await this.authBusinessService.getPermissionInfo(userId);
        return common_2.CommonResult.success(result);
    }
    async register(registerReqVO) {
        const result = await this.authBusinessService.register(registerReqVO);
        return common_2.CommonResult.success(result);
    }
    async smsLogin(smsLoginReqVO) {
        const result = await this.authBusinessService.smsLogin(smsLoginReqVO);
        return common_2.CommonResult.success(result);
    }
    async sendSmsCode(sendSmsCodeReqVO) {
        await this.authBusinessService.sendSmsCode(sendSmsCodeReqVO);
        return common_2.CommonResult.success(true);
    }
    async resetPassword(resetPasswordReqVO) {
        await this.authBusinessService.resetPassword(resetPasswordReqVO);
        return common_2.CommonResult.success(true);
    }
    async socialAuthRedirect(type, redirectUri) {
        const result = await this.authBusinessService.getSocialAuthRedirectUrl(type, redirectUri);
        return common_2.CommonResult.success(result);
    }
    async socialLogin(socialLoginReqVO) {
        const result = await this.authBusinessService.socialLogin(socialLoginReqVO);
        return common_2.CommonResult.success(result);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('/login'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '使用账号密码登录' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthLoginReqVO, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('/logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '登出系统' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('/refresh-token'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '刷新令牌' }),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('/get-permission-info'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户权限信息' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getPermissionInfo", null);
__decorate([
    (0, common_1.Post)('/register'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '用户注册' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthRegisterReqVO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('/sms-login'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '短信登录' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthSmsLoginReqVO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "smsLogin", null);
__decorate([
    (0, common_1.Post)('/send-sms-code'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '发送短信验证码' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthSendSmsCodeReqVO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendSmsCode", null);
__decorate([
    (0, common_1.Post)('/reset-password'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '重置密码' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthResetPasswordReqVO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('/social-auth-redirect'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: '社交登录重定向' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('redirectUri')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "socialAuthRedirect", null);
__decorate([
    (0, common_1.Post)('/social-login'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '社交快速登录' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthSocialLoginReqVO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "socialLogin", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)(`${systemPrefix} - 认证管理`),
    (0, common_1.Controller)(controllerPath),
    __metadata("design:paramtypes", [auth_business_service_1.AuthBusinessService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map