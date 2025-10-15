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
exports.BaseDO = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
class BaseDO {
    id;
    createTime;
    updateTime;
    creator;
    updater;
    deleted;
    tenantId;
}
exports.BaseDO = BaseDO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '主键ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', comment: '主键ID' }),
    __metadata("design:type", Number)
], BaseDO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建时间' }),
    (0, typeorm_1.CreateDateColumn)({
        name: 'create_time',
        comment: '创建时间',
        type: 'timestamp',
    }),
    __metadata("design:type", Date)
], BaseDO.prototype, "createTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新时间' }),
    (0, typeorm_1.UpdateDateColumn)({
        name: 'update_time',
        comment: '更新时间',
        type: 'timestamp',
    }),
    __metadata("design:type", Date)
], BaseDO.prototype, "updateTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建者', required: false }),
    (0, typeorm_1.Column)({
        name: 'creator',
        comment: '创建者',
        type: 'varchar',
        length: 64,
        nullable: true,
    }),
    __metadata("design:type", String)
], BaseDO.prototype, "creator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新者', required: false }),
    (0, typeorm_1.Column)({
        name: 'updater',
        comment: '更新者',
        type: 'varchar',
        length: 64,
        nullable: true,
    }),
    __metadata("design:type", String)
], BaseDO.prototype, "updater", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否删除', required: false }),
    (0, typeorm_1.Column)({
        name: 'deleted',
        comment: '是否删除',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], BaseDO.prototype, "deleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '租户编号', required: false }),
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        comment: '租户编号',
        type: 'bigint',
        nullable: true,
    }),
    __metadata("design:type", Number)
], BaseDO.prototype, "tenantId", void 0);
//# sourceMappingURL=base.entity.js.map