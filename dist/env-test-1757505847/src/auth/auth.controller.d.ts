import { AuthBusinessService } from './auth-business.service';
import { AuthLoginReqVO, AuthLoginRespVO, AuthPermissionInfoRespVO, AuthRegisterReqVO, AuthSmsLoginReqVO, AuthSendSmsCodeReqVO, AuthResetPasswordReqVO, AuthSocialLoginReqVO } from './dto/auth.dto';
import { CommonResult } from '@app/common';
export declare class AuthController {
    private readonly authBusinessService;
    constructor(authBusinessService: AuthBusinessService);
    login(loginReqVO: AuthLoginReqVO, req: any): Promise<CommonResult<AuthLoginRespVO>>;
    logout(req: any): Promise<CommonResult<boolean>>;
    refreshToken(refreshToken: string): Promise<CommonResult<AuthLoginRespVO>>;
    getPermissionInfo(req: any): Promise<CommonResult<AuthPermissionInfoRespVO>>;
    register(registerReqVO: AuthRegisterReqVO): Promise<CommonResult<AuthLoginRespVO>>;
    smsLogin(smsLoginReqVO: AuthSmsLoginReqVO): Promise<CommonResult<AuthLoginRespVO>>;
    sendSmsCode(sendSmsCodeReqVO: AuthSendSmsCodeReqVO): Promise<CommonResult<boolean>>;
    resetPassword(resetPasswordReqVO: AuthResetPasswordReqVO): Promise<CommonResult<boolean>>;
    socialAuthRedirect(type: string, redirectUri: string): Promise<CommonResult<string>>;
    socialLogin(socialLoginReqVO: AuthSocialLoginReqVO): Promise<CommonResult<AuthLoginRespVO>>;
}
