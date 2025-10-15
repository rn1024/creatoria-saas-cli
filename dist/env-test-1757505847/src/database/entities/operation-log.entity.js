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
exports.OperationLogDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
let OperationLogDO = class OperationLogDO extends base_entity_1.BaseEntity {
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
    errorMsg;
    duration;
};
exports.OperationLogDO = OperationLogDO;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OperationLogDO.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OperationLogDO.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OperationLogDO.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OperationLogDO.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OperationLogDO.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OperationLogDO.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OperationLogDO.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OperationLogDO.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], OperationLogDO.prototype, "params", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], OperationLogDO.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OperationLogDO.prototype, "errorMsg", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OperationLogDO.prototype, "duration", void 0);
exports.OperationLogDO = OperationLogDO = __decorate([
    (0, typeorm_1.Entity)('operation_logs')
], OperationLogDO);
//# sourceMappingURL=operation-log.entity.js.map