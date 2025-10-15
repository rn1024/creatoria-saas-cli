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
exports.UserDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
const swagger_1 = require("@nestjs/swagger");
let UserDO = class UserDO extends base_entity_1.BaseDO {
    username;
    nickname;
    email;
    mobile;
    sex;
    avatar;
    password;
    status;
    deptId;
    postIds;
    remark;
    loginIp;
    loginDate;
};
exports.UserDO = UserDO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户账号' }),
    (0, typeorm_1.Column)({
        name: 'username',
        type: 'varchar',
        length: 30,
        unique: true,
        comment: '用户账号',
    }),
    __metadata("design:type", String)
], UserDO.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户昵称' }),
    (0, typeorm_1.Column)({
        name: 'nickname',
        type: 'varchar',
        length: 30,
        comment: '用户昵称',
    }),
    __metadata("design:type", String)
], UserDO.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户邮箱', required: false }),
    (0, typeorm_1.Column)({
        name: 'email',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '用户邮箱',
    }),
    __metadata("design:type", String)
], UserDO.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号码', required: false }),
    (0, typeorm_1.Column)({
        name: 'mobile',
        type: 'varchar',
        length: 11,
        nullable: true,
        comment: '手机号码',
    }),
    __metadata("design:type", String)
], UserDO.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户性别', enum: [0, 1, 2] }),
    (0, typeorm_1.Column)({
        name: 'sex',
        type: 'smallint',
        default: 0,
        comment: '用户性别（0未知 1男 2女）',
    }),
    __metadata("design:type", Number)
], UserDO.prototype, "sex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '头像地址', required: false }),
    (0, typeorm_1.Column)({
        name: 'avatar',
        type: 'varchar',
        length: 512,
        nullable: true,
        comment: '头像地址',
    }),
    __metadata("design:type", String)
], UserDO.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '密码' }),
    (0, typeorm_1.Column)({
        name: 'password',
        type: 'varchar',
        length: 100,
        comment: '密码',
        select: false,
    }),
    __metadata("design:type", String)
], UserDO.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '账号状态', enum: [0, 1] }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'smallint',
        default: 0,
        comment: '账号状态（0正常 1停用）',
    }),
    __metadata("design:type", Number)
], UserDO.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '部门ID', required: false }),
    (0, typeorm_1.Column)({
        name: 'dept_id',
        type: 'bigint',
        nullable: true,
        comment: '部门ID',
    }),
    __metadata("design:type", Number)
], UserDO.prototype, "deptId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位ID数组', type: [Number], required: false }),
    (0, typeorm_1.Column)({
        name: 'post_ids',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '岗位ID，多个用逗号分隔',
        transformer: {
            to: (value) => value?.join(',') || null,
            from: (value) => (value ? value.split(',').map(Number) : []),
        },
    }),
    __metadata("design:type", Array)
], UserDO.prototype, "postIds", void 0);
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
], UserDO.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '最后登录IP', required: false }),
    (0, typeorm_1.Column)({
        name: 'login_ip',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '最后登录IP',
    }),
    __metadata("design:type", String)
], UserDO.prototype, "loginIp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '最后登录时间', required: false }),
    (0, typeorm_1.Column)({
        name: 'login_date',
        type: 'timestamp',
        nullable: true,
        comment: '最后登录时间',
    }),
    __metadata("design:type", Date)
], UserDO.prototype, "loginDate", void 0);
exports.UserDO = UserDO = __decorate([
    (0, typeorm_1.Entity)('system_users')
], UserDO);
//# sourceMappingURL=user.entity.js.map