"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
        if (username === 'admin' && password === 'admin123') {
            return { id: 1, username: 'admin', email: 'admin@example.com' };
        }
        return null;
    }
    async findById(id) {
        if (id === 1) {
            return { id: 1, username: 'admin', email: 'admin@example.com' };
        }
        return null;
    }
    async findByUsername(username) {
        if (username === 'admin') {
            return { id: 1, username: 'admin', email: 'admin@example.com' };
        }
        return null;
    }
    async findByMobile(mobile) {
        return null;
    }
    async findBySocialId(provider, socialId) {
        return null;
    }
    async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return {
            id: Math.floor(Math.random() * 1000),
            username: userData.username,
            email: userData.email,
            mobile: userData.mobile,
            password: hashedPassword,
        };
    }
    async createUserByMobile(mobile) {
        return {
            id: Math.floor(Math.random() * 1000),
            username: mobile,
            mobile: mobile,
        };
    }
    async createUserFromSocial(provider, socialUser) {
        return {
            id: Math.floor(Math.random() * 1000),
            username: socialUser.username || socialUser.email,
            email: socialUser.email,
            avatar: socialUser.avatar,
            socialProvider: provider,
            socialId: socialUser.id,
        };
    }
    async resetPassword(username, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log(`Password reset for ${username}: ${hashedPassword}`);
        return true;
    }
    async verifySmsCode(mobile, code, scene) {
        return code === '123456';
    }
    async sendSmsCode(mobile, scene) {
        console.log(`SMS code sent to ${mobile} for ${scene}: 123456`);
        return true;
    }
    async getSocialAuthUrl(type, redirectUri) {
        const baseUrls = {
            github: 'https://github.com/login/oauth/authorize',
            google: 'https://accounts.google.com/o/oauth2/v2/auth',
            wechat: 'https://open.weixin.qq.com/connect/qrconnect',
        };
        const baseUrl = baseUrls[type] || '';
        return `${baseUrl}?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUri || 'http://localhost:3000/auth/callback'}`;
    }
    async getSocialUserInfo(type, code, state) {
        return {
            id: 'social_' + Math.random().toString(36).substring(7),
            username: 'social_user',
            email: 'social@example.com',
            avatar: 'https://example.com/avatar.jpg',
        };
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }
    async verifyToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            return null;
        }
    }
    async validatePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map