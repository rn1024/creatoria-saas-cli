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
exports.RoleDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
const swagger_1 = require("@nestjs/swagger");
let RoleDO = class RoleDO extends base_entity_1.BaseDO {
    name;
    code;
    sort;
    dataScope;
    dataScopeDeptIds;
    status;
    type;
    remark;
};
exports.RoleDO = RoleDO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色名称' }),
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 30,
        comment: '角色名称',
    }),
    __metadata("design:type", String)
], RoleDO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色权限字符串' }),
    (0, typeorm_1.Column)({
        name: 'code',
        type: 'varchar',
        length: 100,
        comment: '角色权限字符串',
    }),
    __metadata("design:type", String)
], RoleDO.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '显示顺序' }),
    (0, typeorm_1.Column)({
        name: 'sort',
        type: 'int',
        comment: '显示顺序',
    }),
    __metadata("design:type", Number)
], RoleDO.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '数据范围', enum: [1, 2, 3, 4, 5] }),
    (0, typeorm_1.Column)({
        name: 'data_scope',
        type: 'smallint',
        default: 1,
        comment: '数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限）',
    }),
    __metadata("design:type", Number)
], RoleDO.prototype, "dataScope", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '数据范围(指定部门数组)', required: false }),
    (0, typeorm_1.Column)({
        name: 'data_scope_dept_ids',
        type: 'varchar',
        length: 500,
        default: '',
        comment: '数据范围(指定部门数组)',
        transformer: {
            to: (value) => value?.join(',') || '',
            from: (value) => (value ? value.split(',').map(Number) : []),
        },
    }),
    __metadata("design:type", Array)
], RoleDO.prototype, "dataScopeDeptIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色状态', enum: [0, 1] }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'smallint',
        comment: '角色状态（0正常 1停用）',
    }),
    __metadata("design:type", Number)
], RoleDO.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色类型', enum: [1, 2] }),
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'smallint',
        comment: '角色类型（1内置角色 2自定义角色）',
    }),
    __metadata("design:type", Number)
], RoleDO.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', required: false }),
    (0, typeorm_1.Column)({
        name: 'remark',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '备注',
    }),
    __metadata("design:type", String)
], RoleDO.prototype, "remark", void 0);
exports.RoleDO = RoleDO = __decorate([
    (0, typeorm_1.Entity)('system_roles')
], RoleDO);
//# sourceMappingURL=role.entity.js.map