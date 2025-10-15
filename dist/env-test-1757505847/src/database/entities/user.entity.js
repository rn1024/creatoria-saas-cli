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
const base_entity_1 = require("./base.entity");
const role_entity_1 = require("./role.entity");
const dept_entity_1 = require("./dept.entity");
let UserDO = class UserDO extends base_entity_1.BaseEntity {
    username;
    password;
    email;
    nickname;
    avatar;
    phone;
    isActive;
    sex;
    mobile;
    loginIp;
    loginDate;
    roles;
    dept;
    deptId;
};
exports.UserDO = UserDO;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserDO.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserDO.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserDO.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserDO.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserDO.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserDO.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserDO.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], UserDO.prototype, "sex", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserDO.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserDO.prototype, "loginIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], UserDO.prototype, "loginDate", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.RoleDO, role => role.users),
    (0, typeorm_1.JoinTable)({
        name: 'user_roles',
        joinColumn: { name: 'user_id' },
        inverseJoinColumn: { name: 'role_id' }
    }),
    __metadata("design:type", Array)
], UserDO.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => dept_entity_1.DeptDO, dept => dept.users),
    __metadata("design:type", dept_entity_1.DeptDO)
], UserDO.prototype, "dept", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], UserDO.prototype, "deptId", void 0);
exports.UserDO = UserDO = __decorate([
    (0, typeorm_1.Entity)('users')
], UserDO);
//# sourceMappingURL=user.entity.js.map