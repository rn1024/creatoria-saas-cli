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
exports.UserRoleDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
const swagger_1 = require("@nestjs/swagger");
let UserRoleDO = class UserRoleDO extends base_entity_1.BaseDO {
    userId;
    roleId;
};
exports.UserRoleDO = UserRoleDO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户ID' }),
    (0, typeorm_1.Column)({
        name: 'user_id',
        type: 'bigint',
        comment: '用户ID',
    }),
    __metadata("design:type", Number)
], UserRoleDO.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色ID' }),
    (0, typeorm_1.Column)({
        name: 'role_id',
        type: 'bigint',
        comment: '角色ID',
    }),
    __metadata("design:type", Number)
], UserRoleDO.prototype, "roleId", void 0);
exports.UserRoleDO = UserRoleDO = __decorate([
    (0, typeorm_1.Entity)('system_user_roles')
], UserRoleDO);
//# sourceMappingURL=user-role.entity.js.map