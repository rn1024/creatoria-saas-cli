import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    validateUser(username: string, password: string): Promise<any>;
    findById(id: number): Promise<any>;
    findByUsername(username: string): Promise<any>;
    findByMobile(mobile: string): Promise<any>;
    findBySocialId(provider: string, socialId: string): Promise<any>;
    createUser(userData: any): Promise<any>;
    createUserByMobile(mobile: string): Promise<any>;
    createUserFromSocial(provider: string, socialUser: any): Promise<any>;
    resetPassword(username: string, newPassword: string): Promise<boolean>;
    verifySmsCode(mobile: string, code: string, scene: string): Promise<boolean>;
    sendSmsCode(mobile: string, scene: string): Promise<boolean>;
    getSocialAuthUrl(type: string, redirectUri?: string): Promise<string>;
    getSocialUserInfo(type: string, code: string, state: string): Promise<any>;
    generateToken(user: any): {
        accessToken: string;
        refreshToken: string;
    };
    verifyToken(token: string): Promise<any>;
    validatePassword(password: string, hashedPassword: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
}
