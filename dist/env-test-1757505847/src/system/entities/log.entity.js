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
exports.SysLog = void 0;
const typeorm_1 = require("typeorm");
let SysLog = class SysLog {
    id;
    userId;
    username;
    module;
    action;
    method;
    url;
    ip;
    userAgent;
    params;
    result;
    level;
    duration;
    createdAt;
};
exports.SysLog = SysLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SysLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '用户ID' }),
    __metadata("design:type", Number)
], SysLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '用户名' }),
    __metadata("design:type", String)
], SysLog.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '模块' }),
    __metadata("design:type", String)
], SysLog.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '操作' }),
    __metadata("design:type", String)
], SysLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '请求方法' }),
    __metadata("design:type", String)
], SysLog.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '请求URL' }),
    __metadata("design:type", String)
], SysLog.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: 'IP地址' }),
    __metadata("design:type", String)
], SysLog.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '用户代理' }),
    __metadata("design:type", String)
], SysLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '请求参数' }),
    __metadata("design:type", String)
], SysLog.prototype, "params", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '响应结果' }),
    __metadata("design:type", String)
], SysLog.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'info', comment: '日志级别' }),
    __metadata("design:type", String)
], SysLog.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '执行时间(ms)' }),
    __metadata("design:type", Number)
], SysLog.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", Date)
], SysLog.prototype, "createdAt", void 0);
exports.SysLog = SysLog = __decorate([
    (0, typeorm_1.Entity)('sys_log'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['module']),
    (0, typeorm_1.Index)(['createdAt'])
], SysLog);
//# sourceMappingURL=log.entity.js.map