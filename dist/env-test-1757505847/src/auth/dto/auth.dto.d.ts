export declare class AuthLoginReqVO {
    username: string;
    password: string;
}
export declare class AuthLoginRespVO {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
    user: any;
}
export declare class AuthRegisterReqVO {
    username: string;
    password: string;
}
export declare class AuthSmsLoginReqVO {
    mobile: string;
    code: string;
}
export declare class AuthSendSmsCodeReqVO {
    mobile: string;
    scene: string;
}
export declare class AuthResetPasswordReqVO {
    username: string;
    code: string;
    password: string;
}
export declare class AuthSocialLoginReqVO {
    type: string;
    code: string;
    state: string;
    redirectUri?: string;
}
export declare class AuthPermissionInfoRespVO {
    permissions: string[];
    roles: string[];
    menus?: any[];
    user: any;
}
export declare class RefreshTokenReqVO {
    refreshToken: string;
}
export declare class ChangePasswordReqVO {
    oldPassword: string;
    newPassword: string;
}
