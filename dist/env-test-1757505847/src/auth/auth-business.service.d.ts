import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthLoginReqVO, AuthLoginRespVO, AuthPermissionInfoRespVO, AuthRegisterReqVO, AuthSmsLoginReqVO, AuthSendSmsCodeReqVO, AuthResetPasswordReqVO, AuthSocialLoginReqVO } from './dto/auth.dto';
export declare class AuthBusinessService {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    login(loginReq: AuthLoginReqVO, clientIP?: string): Promise<AuthLoginRespVO>;
    logout(userId: number): Promise<boolean>;
    refreshToken(refreshToken: string): Promise<AuthLoginRespVO>;
    getPermissionInfo(userId: number): Promise<AuthPermissionInfoRespVO>;
    register(registerReq: AuthRegisterReqVO): Promise<AuthLoginRespVO>;
    smsLogin(smsLoginReq: AuthSmsLoginReqVO): Promise<AuthLoginRespVO>;
    sendSmsCode(sendReq: AuthSendSmsCodeReqVO): Promise<boolean>;
    resetPassword(resetReq: AuthResetPasswordReqVO): Promise<boolean>;
    getSocialAuthRedirectUrl(type: string, redirectUri: string): Promise<string>;
    socialLogin(socialReq: AuthSocialLoginReqVO): Promise<AuthLoginRespVO>;
    private sanitizeUser;
}
