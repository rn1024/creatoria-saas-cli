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
const base_entity_1 = require("./base.entity");
const user_entity_1 = require("./user.entity");
let DeptDO = class DeptDO extends base_entity_1.BaseEntity {
    name;
    sort;
    leaderUserId;
    phone;
    email;
    status;
    children;
    parent;
    users;
};
exports.DeptDO = DeptDO;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DeptDO.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DeptDO.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], DeptDO.prototype, "leaderUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DeptDO.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DeptDO.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], DeptDO.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.TreeChildren)(),
    __metadata("design:type", Array)
], DeptDO.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.TreeParent)(),
    __metadata("design:type", DeptDO)
], DeptDO.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.UserDO, user => user.dept),
    __metadata("design:type", Array)
], DeptDO.prototype, "users", void 0);
exports.DeptDO = DeptDO = __decorate([
    (0, typeorm_1.Entity)('departments'),
    (0, typeorm_1.Tree)('closure-table')
], DeptDO);
//# sourceMappingURL=dept.entity.js.map