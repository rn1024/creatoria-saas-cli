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
exports.DeptDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
const swagger_1 = require("@nestjs/swagger");
let DeptDO = class DeptDO extends base_entity_1.BaseDO {
    name;
    parentId;
    sort;
    leaderUserId;
    phone;
    email;
    status;
};
exports.DeptDO = DeptDO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '部门名称' }),
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 30,
        comment: '部门名称',
    }),
    __metadata("design:type", String)
], DeptDO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '父部门ID' }),
    (0, typeorm_1.Column)({
        name: 'parent_id',
        type: 'bigint',
        default: 0,
        comment: '父部门ID',
    }),
    __metadata("design:type", Number)
], DeptDO.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '显示顺序' }),
    (0, typeorm_1.Column)({
        name: 'sort',
        type: 'int',
        comment: '显示顺序',
    }),
    __metadata("design:type", Number)
], DeptDO.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '负责人' }),
    (0, typeorm_1.Column)({
        name: 'leader_user_id',
        type: 'bigint',
        nullable: true,
        comment: '负责人',
    }),
    __metadata("design:type", Number)
], DeptDO.prototype, "leaderUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '联系电话' }),
    (0, typeorm_1.Column)({
        name: 'phone',
        type: 'varchar',
        length: 11,
        nullable: true,
        comment: '联系电话',
    }),
    __metadata("design:type", String)
], DeptDO.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '邮箱' }),
    (0, typeorm_1.Column)({
        name: 'email',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '邮箱',
    }),
    __metadata("design:type", String)
], DeptDO.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '部门状态', enum: [0, 1] }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'smallint',
        comment: '部门状态（0正常 1停用）',
    }),
    __metadata("design:type", Number)
], DeptDO.prototype, "status", void 0);
exports.DeptDO = DeptDO = __decorate([
    (0, typeorm_1.Entity)('system_dept')
], DeptDO);
//# sourceMappingURL=dept.entity.js.map