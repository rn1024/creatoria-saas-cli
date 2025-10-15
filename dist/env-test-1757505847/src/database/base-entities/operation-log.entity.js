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
exports.OperateLogDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
let OperateLogDO = class OperateLogDO extends base_entity_1.BaseDO {
    traceId;
    userId;
    userType;
    module;
    name;
    type;
    content;
    exts;
    requestMethod;
    requestUrl;
    userIp;
    userAgent;
    javaMethod;
    javaMethodArgs;
    startTime;
    duration;
    resultCode;
    resultMsg;
    resultData;
    bizId;
};
exports.OperateLogDO = OperateLogDO;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OperateLogDO.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'trace_id',
        type: 'varchar',
        length: 64,
        nullable: true,
        comment: '链路追踪编号'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_id',
        type: 'bigint',
        comment: '用户编号'
    }),
    __metadata("design:type", Number)
], OperateLogDO.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_type',
        type: 'tinyint',
        default: 0,
        comment: '用户类型'
    }),
    __metadata("design:type", Number)
], OperateLogDO.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'module',
        type: 'varchar',
        length: 50,
        comment: '操作模块'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 50,
        comment: '操作名'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'tinyint',
        comment: '操作分类'
    }),
    __metadata("design:type", Number)
], OperateLogDO.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'content',
        type: 'text',
        nullable: true,
        comment: '操作明细'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'exts',
        type: 'json',
        nullable: true,
        comment: '拓展字段'
    }),
    __metadata("design:type", Object)
], OperateLogDO.prototype, "exts", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'request_method',
        type: 'varchar',
        length: 16,
        comment: '请求方法名'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "requestMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'request_url',
        type: 'varchar',
        length: 255,
        comment: '请求地址'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "requestUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_ip',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '用户 IP'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "userIp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_agent',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '浏览器 UA'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'java_method',
        type: 'varchar',
        length: 512,
        comment: 'Java 方法名'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "javaMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'java_method_args',
        type: 'text',
        nullable: true,
        comment: 'Java 方法的参数'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "javaMethodArgs", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'start_time',
        type: 'timestamp',
        comment: '操作时间'
    }),
    __metadata("design:type", Date)
], OperateLogDO.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'duration',
        type: 'int',
        comment: '执行时长'
    }),
    __metadata("design:type", Number)
], OperateLogDO.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'result_code',
        type: 'int',
        default: 0,
        comment: '结果码'
    }),
    __metadata("design:type", Number)
], OperateLogDO.prototype, "resultCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'result_msg',
        type: 'varchar',
        length: 512,
        nullable: true,
        comment: '结果提示'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "resultMsg", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'result_data',
        type: 'text',
        nullable: true,
        comment: '结果数据'
    }),
    __metadata("design:type", String)
], OperateLogDO.prototype, "resultData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'biz_id',
        type: 'bigint',
        nullable: true,
        comment: '业务编号'
    }),
    __metadata("design:type", Number)
], OperateLogDO.prototype, "bizId", void 0);
exports.OperateLogDO = OperateLogDO = __decorate([
    (0, typeorm_1.Entity)('system_operate_log'),
    (0, typeorm_1.Index)('idx_operate_user_id', ['userId']),
    (0, typeorm_1.Index)('idx_operate_biz_id', ['bizId']),
    (0, typeorm_1.Index)('idx_operate_create_time', ['createTime'])
], OperateLogDO);
//# sourceMappingURL=operation-log.entity.js.map