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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordReqVO = exports.RefreshTokenReqVO = exports.AuthPermissionInfoRespVO = exports.AuthSocialLoginReqVO = exports.AuthResetPasswordReqVO = exports.AuthSendSmsCodeReqVO = exports.AuthSmsLoginReqVO = exports.AuthRegisterReqVO = exports.AuthLoginRespVO = exports.AuthLoginReqVO = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AuthLoginReqVO {
    username;
    password;
}
exports.AuthLoginReqVO = AuthLoginReqVO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户名' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthLoginReqVO.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '密码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], AuthLoginReqVO.prototype, "password", void 0);
class AuthLoginRespVO {
    accessToken;
    refreshToken;
    expiresIn;
    user;
}
exports.AuthLoginRespVO = AuthLoginRespVO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '访问令牌' }),
    __metadata("design:type", String)
], AuthLoginRespVO.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '刷新令牌' }),
    __metadata("design:type", String)
], AuthLoginRespVO.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '令牌过期时间（秒）' }),
    __metadata("design:type", Number)
], AuthLoginRespVO.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户信息' }),
    __metadata("design:type", Object)
], AuthLoginRespVO.prototype, "user", void 0);
class AuthRegisterReqVO {
    username;
    password;
}
exports.AuthRegisterReqVO = AuthRegisterReqVO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户名' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(4),
    __metadata("design:type", String)
], AuthRegisterReqVO.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '密码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], AuthRegisterReqVO.prototype, "password", void 0);
class AuthSmsLoginReqVO {
    mobile;
    code;
}
exports.AuthSmsLoginReqVO = AuthSmsLoginReqVO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号' }),
    (0, class_validator_1.IsMobilePhone)('zh-CN'),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthSmsLoginReqVO.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '验证码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(4),
    __metadata("design:type", String)
], AuthSmsLoginReqVO.prototype, "code", void 0);
class AuthSendSmsCodeReqVO {
    mobile;
    scene;
}
exports.AuthSendSmsCodeReqVO = AuthSendSmsCodeReqVO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号' }),
    (0, class_validator_1.IsMobilePhone)('zh-CN'),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthSendSmsCodeReqVO.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '场景',
        enum: ['login', 'register', 'reset-password', 'bind-mobile'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthSendSmsCodeReqVO.prototype, "scene", void 0);
class AuthResetPasswordReqVO {
    username;
    code;
    password;
}
exports.AuthResetPasswordReqVO = AuthResetPasswordReqVO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户名或手机号' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthResetPasswordReqVO.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '验证码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthResetPasswordReqVO.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '新密码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], AuthResetPasswordReqVO.prototype, "password", void 0);
class AuthSocialLoginReqVO {
    type;
    code;
    state;
    redirectUri;
}
exports.AuthSocialLoginReqVO = AuthSocialLoginReqVO;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '第三方平台类型',
        enum: ['wechat', 'qq', 'weibo', 'github', 'google'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthSocialLoginReqVO.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '授权码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthSocialLoginReqVO.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AuthSocialLoginReqVO.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '重定向URI' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthSocialLoginReqVO.prototype, "redirectUri", void 0);
class AuthPermissionInfoRespVO {
    permissions;
    roles;
    menus;
    user;
}
exports.AuthPermissionInfoRespVO = AuthPermissionInfoRespVO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '权限列表', type: [String] }),
    __metadata("design:type", Array)
], AuthPermissionInfoRespVO.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色列表', type: [String] }),
    __metadata("design:type", Array)
], AuthPermissionInfoRespVO.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '菜单列表', required: false }),
    __metadata("design:type", Array)
], AuthPermissionInfoRespVO.prototype, "menus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户信息' }),
    __metadata("design:type", Object)
], AuthPermissionInfoRespVO.prototype, "user", void 0);
class RefreshTokenReqVO {
    refreshToken;
}
exports.RefreshTokenReqVO = RefreshTokenReqVO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '刷新令牌' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefreshTokenReqVO.prototype, "refreshToken", void 0);
class ChangePasswordReqVO {
    oldPassword;
    newPassword;
}
exports.ChangePasswordReqVO = ChangePasswordReqVO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '旧密码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangePasswordReqVO.prototype, "oldPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '新密码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ChangePasswordReqVO.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map