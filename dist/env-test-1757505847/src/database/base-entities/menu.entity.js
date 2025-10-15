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
exports.MenuDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
const swagger_1 = require("@nestjs/swagger");
let MenuDO = class MenuDO extends base_entity_1.BaseDO {
    name;
    permission;
    type;
    sort;
    parentId;
    path;
    icon;
    component;
    componentName;
    status;
    visible;
    keepAlive;
    alwaysShow;
};
exports.MenuDO = MenuDO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '菜单名称' }),
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 50,
        comment: '菜单名称',
    }),
    __metadata("design:type", String)
], MenuDO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '权限标识', required: false }),
    (0, typeorm_1.Column)({
        name: 'permission',
        type: 'varchar',
        length: 100,
        default: '',
        comment: '权限标识',
    }),
    __metadata("design:type", String)
], MenuDO.prototype, "permission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '菜单类型', enum: [1, 2, 3] }),
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'smallint',
        comment: '菜单类型（1目录 2菜单 3按钮）',
    }),
    __metadata("design:type", Number)
], MenuDO.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '显示顺序' }),
    (0, typeorm_1.Column)({
        name: 'sort',
        type: 'int',
        default: 0,
        comment: '显示顺序',
    }),
    __metadata("design:type", Number)
], MenuDO.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '父菜单ID' }),
    (0, typeorm_1.Column)({
        name: 'parent_id',
        type: 'bigint',
        default: 0,
        comment: '父菜单ID',
    }),
    __metadata("design:type", Number)
], MenuDO.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '路由地址', required: false }),
    (0, typeorm_1.Column)({
        name: 'path',
        type: 'varchar',
        length: 200,
        default: '',
        comment: '路由地址',
    }),
    __metadata("design:type", String)
], MenuDO.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '菜单图标', required: false }),
    (0, typeorm_1.Column)({
        name: 'icon',
        type: 'varchar',
        length: 100,
        default: '#',
        comment: '菜单图标',
    }),
    __metadata("design:type", String)
], MenuDO.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件路径', required: false }),
    (0, typeorm_1.Column)({
        name: 'component',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '组件路径',
    }),
    __metadata("design:type", String)
], MenuDO.prototype, "component", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件名字', required: false }),
    (0, typeorm_1.Column)({
        name: 'component_name',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '组件名字',
    }),
    __metadata("design:type", String)
], MenuDO.prototype, "componentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '菜单状态', enum: [0, 1] }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'smallint',
        default: 0,
        comment: '菜单状态（0正常 1停用）',
    }),
    __metadata("design:type", Number)
], MenuDO.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否显示', required: false }),
    (0, typeorm_1.Column)({
        name: 'visible',
        type: 'boolean',
        default: true,
        comment: '是否显示',
    }),
    __metadata("design:type", Boolean)
], MenuDO.prototype, "visible", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否缓存', required: false }),
    (0, typeorm_1.Column)({
        name: 'keep_alive',
        type: 'boolean',
        default: true,
        comment: '是否缓存',
    }),
    __metadata("design:type", Boolean)
], MenuDO.prototype, "keepAlive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否总是显示', required: false }),
    (0, typeorm_1.Column)({
        name: 'always_show',
        type: 'boolean',
        default: true,
        comment: '是否总是显示',
    }),
    __metadata("design:type", Boolean)
], MenuDO.prototype, "alwaysShow", void 0);
exports.MenuDO = MenuDO = __decorate([
    (0, typeorm_1.Entity)('system_menus')
], MenuDO);
//# sourceMappingURL=menu.entity.js.map