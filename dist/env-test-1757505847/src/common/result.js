"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.GlobalErrorCodeConstants = exports.PageResult = exports.CommonResult = void 0;
class CommonResult {
    code;
    message;
    data;
    timestamp;
    constructor(code, message, data, timestamp = Date.now()) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp;
    }
    static success(data, message = 'Success') {
        return new CommonResult(200, message, data);
    }
    static error(message, code = 500) {
        return new CommonResult(code, message);
    }
}
exports.CommonResult = CommonResult;
class PageResult {
    list;
    total;
    page;
    pageSize;
    constructor(list, total, page, pageSize) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }
}
exports.PageResult = PageResult;
class GlobalErrorCodeConstants {
    static UNAUTHORIZED = 401;
    static FORBIDDEN = 403;
    static NOT_FOUND = 404;
    static BAD_REQUEST = 400;
    static INTERNAL_ERROR = 500;
    static USER_NOT_EXISTS = 1001;
    static USER_DISABLED = 1002;
    static USER_PASSWORD_FAILED = 1003;
}
exports.GlobalErrorCodeConstants = GlobalErrorCodeConstants;
class ErrorMessages {
    static UNAUTHORIZED = 'Unauthorized';
    static FORBIDDEN = 'Forbidden';
    static NOT_FOUND = 'Not Found';
    static BAD_REQUEST = 'Bad Request';
    static INTERNAL_ERROR = 'Internal Server Error';
    static [GlobalErrorCodeConstants.USER_NOT_EXISTS] = 'User does not exist';
    static [GlobalErrorCodeConstants.USER_DISABLED] = 'User is disabled';
    static [GlobalErrorCodeConstants.USER_PASSWORD_FAILED] = 'Password is incorrect';
}
exports.ErrorMessages = ErrorMessages;
//# sourceMappingURL=result.js.map