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
exports.AuthBusinessService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
let AuthBusinessService = class AuthBusinessService {
    authService;
    jwtService;
    constructor(authService, jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }
    async login(loginReq, clientIP) {
        const user = await this.authService.validateUser(loginReq.username, loginReq.password);
        if (!user) {
            throw new Error('用户名或密码错误');
        }
        const payload = {
            sub: user.id,
            username: user.username,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken,
            user: this.sanitizeUser(user),
        };
    }
    async logout(userId) {
        return true;
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.authService.findById(payload.sub);
            if (!user) {
                throw new Error('用户不存在');
            }
            const newPayload = {
                sub: user.id,
                username: user.username,
            };
            const accessToken = this.jwtService.sign(newPayload);
            const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '30d' });
            return {
                accessToken,
                refreshToken: newRefreshToken,
                user: this.sanitizeUser(user),
            };
        }
        catch (error) {
            throw new Error('刷新token失败');
        }
    }
    async getPermissionInfo(userId) {
        const user = await this.authService.findById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        const permissions = ['system:user:list', 'system:user:create'];
        const roles = ['admin'];
        return {
            permissions,
            roles,
            user: this.sanitizeUser(user),
        };
    }
    async register(registerReq) {
        const existingUser = await this.authService.findByUsername(registerReq.username);
        if (existingUser) {
            throw new Error('用户名已存在');
        }
        const user = await this.authService.createUser({
            username: registerReq.username,
            password: registerReq.password,
        });
        return this.login({
            username: registerReq.username,
            password: registerReq.password,
        });
    }
    async smsLogin(smsLoginReq) {
        const isValid = await this.authService.verifySmsCode(smsLoginReq.mobile, smsLoginReq.code);
        if (!isValid) {
            throw new Error('验证码错误或已过期');
        }
        let user = await this.authService.findByMobile(smsLoginReq.mobile);
        if (!user) {
            user = await this.authService.createUserByMobile(smsLoginReq.mobile);
        }
        const payload = { sub: user.id, username: user.username };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken,
            user: this.sanitizeUser(user),
        };
    }
    async sendSmsCode(sendReq) {
        return await this.authService.sendSmsCode(sendReq.mobile, sendReq.scene);
    }
    async resetPassword(resetReq) {
        const isValid = await this.authService.verifySmsCode(resetReq.username, resetReq.code);
        if (!isValid) {
            throw new Error('验证码错误或已过期');
        }
        return await this.authService.resetPassword(resetReq.username, resetReq.password);
    }
    async getSocialAuthRedirectUrl(type, redirectUri) {
        return await this.authService.getSocialAuthUrl(type, redirectUri);
    }
    async socialLogin(socialReq) {
        const socialUser = await this.authService.getSocialUserInfo(socialReq.type, socialReq.code);
        let user = await this.authService.findBySocialId(socialReq.type, socialUser.id);
        if (!user) {
            user = await this.authService.createUserFromSocial(socialReq.type, socialUser);
        }
        const payload = { sub: user.id, username: user.username };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken,
            user: this.sanitizeUser(user),
        };
    }
    sanitizeUser(user) {
        const { password, salt, ...sanitized } = user;
        return sanitized;
    }
};
exports.AuthBusinessService = AuthBusinessService;
exports.AuthBusinessService = AuthBusinessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService])
], AuthBusinessService);
//# sourceMappingURL=auth-business.service.js.map