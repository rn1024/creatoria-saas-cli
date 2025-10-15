export declare class CommonResult<T = any> {
    code: number;
    message: string;
    data?: T | undefined;
    timestamp: number;
    constructor(code: number, message: string, data?: T | undefined, timestamp?: number);
    static success<T>(data?: T, message?: string): CommonResult<T>;
    static error(message: string, code?: number): CommonResult;
}
export declare class PageResult<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
    constructor(list: T[], total: number, page: number, pageSize: number);
}
export declare class GlobalErrorCodeConstants {
    static readonly UNAUTHORIZED = 401;
    static readonly FORBIDDEN = 403;
    static readonly NOT_FOUND = 404;
    static readonly BAD_REQUEST = 400;
    static readonly INTERNAL_ERROR = 500;
    static readonly USER_NOT_EXISTS = 1001;
    static readonly USER_DISABLED = 1002;
    static readonly USER_PASSWORD_FAILED = 1003;
}
export declare class ErrorMessages {
    static readonly UNAUTHORIZED = "Unauthorized";
    static readonly FORBIDDEN = "Forbidden";
    static readonly NOT_FOUND = "Not Found";
    static readonly BAD_REQUEST = "Bad Request";
    static readonly INTERNAL_ERROR = "Internal Server Error";
    static readonly [GlobalErrorCodeConstants.USER_NOT_EXISTS] = "User does not exist";
    static readonly [GlobalErrorCodeConstants.USER_DISABLED] = "User is disabled";
    static readonly [GlobalErrorCodeConstants.USER_PASSWORD_FAILED] = "Password is incorrect";
}
