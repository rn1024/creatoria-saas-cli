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
exports.TenantPackageDO = exports.TenantDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
let TenantDO = class TenantDO extends base_entity_1.BaseDO {
    static PACKAGE_ID_SYSTEM = 0;
    name;
    contactUserId;
    contactName;
    contactMobile;
    status;
    website;
    packageId;
    expireTime;
    accountCount;
};
exports.TenantDO = TenantDO;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TenantDO.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        unique: true,
        comment: '租户名'
    }),
    __metadata("design:type", String)
], TenantDO.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'contact_user_id',
        type: 'bigint',
        nullable: true,
        comment: '联系人的用户编号'
    }),
    __metadata("design:type", Number)
], TenantDO.prototype, "contactUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'contact_name',
        type: 'varchar',
        length: 30,
        nullable: true,
        comment: '联系人'
    }),
    __metadata("design:type", String)
], TenantDO.prototype, "contactName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'contact_mobile',
        type: 'varchar',
        length: 20,
        nullable: true,
        comment: '联系手机'
    }),
    __metadata("design:type", String)
], TenantDO.prototype, "contactMobile", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'tinyint',
        default: 0,
        comment: '租户状态（0正常 1停用）'
    }),
    __metadata("design:type", Number)
], TenantDO.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '绑定域名'
    }),
    __metadata("design:type", String)
], TenantDO.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'package_id',
        type: 'bigint',
        default: 0,
        comment: '租户套餐编号'
    }),
    __metadata("design:type", Number)
], TenantDO.prototype, "packageId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'expire_time',
        type: 'timestamp',
        nullable: true,
        comment: '过期时间'
    }),
    __metadata("design:type", Date)
], TenantDO.prototype, "expireTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_count',
        type: 'int',
        default: 0,
        comment: '账号数量'
    }),
    __metadata("design:type", Number)
], TenantDO.prototype, "accountCount", void 0);
exports.TenantDO = TenantDO = __decorate([
    (0, typeorm_1.Entity)('system_tenant'),
    (0, typeorm_1.Index)('idx_tenant_name', ['name'], { unique: true })
], TenantDO);
let TenantPackageDO = class TenantPackageDO extends base_entity_1.BaseDO {
    name;
    status;
    remark;
    menuIds;
};
exports.TenantPackageDO = TenantPackageDO;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TenantPackageDO.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        unique: true,
        comment: '套餐名'
    }),
    __metadata("design:type", String)
], TenantPackageDO.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'tinyint',
        default: 0,
        comment: '租户套餐状态（0正常 1停用）'
    }),
    __metadata("design:type", Number)
], TenantPackageDO.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '备注'
    }),
    __metadata("design:type", String)
], TenantPackageDO.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'menu_ids',
        type: 'json',
        nullable: true,
        comment: '关联的菜单编号'
    }),
    __metadata("design:type", Array)
], TenantPackageDO.prototype, "menuIds", void 0);
exports.TenantPackageDO = TenantPackageDO = __decorate([
    (0, typeorm_1.Entity)('system_tenant_package'),
    (0, typeorm_1.Index)('idx_tenant_package_name', ['name'], { unique: true })
], TenantPackageDO);
//# sourceMappingURL=tenant.entity.js.map