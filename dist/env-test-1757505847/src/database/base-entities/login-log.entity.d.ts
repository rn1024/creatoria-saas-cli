import { BaseDO } from '../base.entity';
export declare class LoginLogDO extends BaseDO {
    id: number;
    logType: number;
    traceId?: string;
    userId?: number;
    userType: number;
    username: string;
    result: number;
    userIp: string;
    userAgent?: string;
}
export declare enum LoginLogTypeEnum {
    LOGIN_USERNAME = 100,
    LOGIN_SOCIAL = 101,
    LOGIN_MOBILE = 103,
    LOGIN_SMS = 104,
    LOGOUT_SELF = 200,
    LOGOUT_DELETE = 202
}
export declare enum LoginResultEnum {
    SUCCESS = 0,
    BAD_CREDENTIALS = 10,
    USER_DISABLED = 20,
    CAPTCHA_NOT_FOUND = 30,
    CAPTCHA_CODE_ERROR = 31
}
