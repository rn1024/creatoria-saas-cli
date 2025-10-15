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
const base_entity_1 = require("./base.entity");
const user_entity_1 = require("./user.entity");
const menu_entity_1 = require("./menu.entity");
let RoleDO = class RoleDO extends base_entity_1.BaseEntity {
    name;
    displayName;
    description;
    sort;
    status;
    users;
    menus;
};
exports.RoleDO = RoleDO;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], RoleDO.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RoleDO.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RoleDO.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RoleDO.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RoleDO.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.UserDO, user => user.roles),
    __metadata("design:type", Array)
], RoleDO.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => menu_entity_1.MenuDO),
    (0, typeorm_1.JoinTable)({
        name: 'role_menus',
        joinColumn: { name: 'role_id' },
        inverseJoinColumn: { name: 'menu_id' }
    }),
    __metadata("design:type", Array)
], RoleDO.prototype, "menus", void 0);
exports.RoleDO = RoleDO = __decorate([
    (0, typeorm_1.Entity)('roles')
], RoleDO);
//# sourceMappingURL=role.entity.js.map