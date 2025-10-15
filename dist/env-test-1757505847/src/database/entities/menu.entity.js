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
const base_entity_1 = require("./base.entity");
const role_entity_1 = require("./role.entity");
let MenuDO = class MenuDO extends base_entity_1.BaseEntity {
    name;
    path;
    component;
    icon;
    sort;
    visible;
    status;
    permission;
    type;
    children;
    parent;
    roles;
};
exports.MenuDO = MenuDO;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MenuDO.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuDO.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuDO.prototype, "component", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuDO.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MenuDO.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], MenuDO.prototype, "visible", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], MenuDO.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuDO.prototype, "permission", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MenuDO.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.TreeChildren)(),
    __metadata("design:type", Array)
], MenuDO.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.TreeParent)(),
    __metadata("design:type", MenuDO)
], MenuDO.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.RoleDO, role => role.menus),
    __metadata("design:type", Array)
], MenuDO.prototype, "roles", void 0);
exports.MenuDO = MenuDO = __decorate([
    (0, typeorm_1.Entity)('menus'),
    (0, typeorm_1.Tree)('closure-table')
], MenuDO);
//# sourceMappingURL=menu.entity.js.map