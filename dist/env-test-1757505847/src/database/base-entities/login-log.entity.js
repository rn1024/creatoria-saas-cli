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
exports.LoginResultEnum = exports.LoginLogTypeEnum = exports.LoginLogDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
let LoginLogDO = class LoginLogDO extends base_entity_1.BaseDO {
    logType;
    traceId;
    userId;
    userType;
    username;
    result;
    userIp;
    userAgent;
};
exports.LoginLogDO = LoginLogDO;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LoginLogDO.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'log_type',
        type: 'tinyint',
        comment: '日志类型'
    }),
    __metadata("design:type", Number)
], LoginLogDO.prototype, "logType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'trace_id',
        type: 'varchar',
        length: 64,
        nullable: true,
        comment: '链路追踪编号'
    }),
    __metadata("design:type", String)
], LoginLogDO.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_id',
        type: 'bigint',
        nullable: true,
        comment: '用户编号'
    }),
    __metadata("design:type", Number)
], LoginLogDO.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_type',
        type: 'tinyint',
        default: 0,
        comment: '用户类型'
    }),
    __metadata("design:type", Number)
], LoginLogDO.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'username',
        type: 'varchar',
        length: 50,
        comment: '用户账号'
    }),
    __metadata("design:type", String)
], LoginLogDO.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'result',
        type: 'tinyint',
        comment: '登录结果'
    }),
    __metadata("design:type", Number)
], LoginLogDO.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_ip',
        type: 'varchar',
        length: 50,
        comment: '用户 IP'
    }),
    __metadata("design:type", String)
], LoginLogDO.prototype, "userIp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_agent',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '浏览器 UA'
    }),
    __metadata("design:type", String)
], LoginLogDO.prototype, "userAgent", void 0);
exports.LoginLogDO = LoginLogDO = __decorate([
    (0, typeorm_1.Entity)('system_login_log'),
    (0, typeorm_1.Index)('idx_login_user_id', ['userId']),
    (0, typeorm_1.Index)('idx_login_username', ['username']),
    (0, typeorm_1.Index)('idx_login_create_time', ['createTime'])
], LoginLogDO);
var LoginLogTypeEnum;
(function (LoginLogTypeEnum) {
    LoginLogTypeEnum[LoginLogTypeEnum["LOGIN_USERNAME"] = 100] = "LOGIN_USERNAME";
    LoginLogTypeEnum[LoginLogTypeEnum["LOGIN_SOCIAL"] = 101] = "LOGIN_SOCIAL";
    LoginLogTypeEnum[LoginLogTypeEnum["LOGIN_MOBILE"] = 103] = "LOGIN_MOBILE";
    LoginLogTypeEnum[LoginLogTypeEnum["LOGIN_SMS"] = 104] = "LOGIN_SMS";
    LoginLogTypeEnum[LoginLogTypeEnum["LOGOUT_SELF"] = 200] = "LOGOUT_SELF";
    LoginLogTypeEnum[LoginLogTypeEnum["LOGOUT_DELETE"] = 202] = "LOGOUT_DELETE";
})(LoginLogTypeEnum || (exports.LoginLogTypeEnum = LoginLogTypeEnum = {}));
var LoginResultEnum;
(function (LoginResultEnum) {
    LoginResultEnum[LoginResultEnum["SUCCESS"] = 0] = "SUCCESS";
    LoginResultEnum[LoginResultEnum["BAD_CREDENTIALS"] = 10] = "BAD_CREDENTIALS";
    LoginResultEnum[LoginResultEnum["USER_DISABLED"] = 20] = "USER_DISABLED";
    LoginResultEnum[LoginResultEnum["CAPTCHA_NOT_FOUND"] = 30] = "CAPTCHA_NOT_FOUND";
    LoginResultEnum[LoginResultEnum["CAPTCHA_CODE_ERROR"] = 31] = "CAPTCHA_CODE_ERROR";
})(LoginResultEnum || (exports.LoginResultEnum = LoginResultEnum = {}));
//# sourceMappingURL=login-log.entity.js.map