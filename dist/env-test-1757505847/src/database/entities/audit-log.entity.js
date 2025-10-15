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
exports.AuditLogDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
let AuditLogDO = class AuditLogDO extends base_entity_1.BaseEntity {
    userId;
    username;
    entityName;
    entityId;
    operation;
    oldData;
    newData;
    ip;
    userAgent;
};
exports.AuditLogDO = AuditLogDO;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AuditLogDO.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditLogDO.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditLogDO.prototype, "entityName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AuditLogDO.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditLogDO.prototype, "operation", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], AuditLogDO.prototype, "oldData", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], AuditLogDO.prototype, "newData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogDO.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogDO.prototype, "userAgent", void 0);
exports.AuditLogDO = AuditLogDO = __decorate([
    (0, typeorm_1.Entity)('audit_logs')
], AuditLogDO);
//# sourceMappingURL=audit-log.entity.js.map