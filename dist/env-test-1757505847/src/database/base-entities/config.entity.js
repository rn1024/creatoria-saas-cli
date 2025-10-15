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
exports.ConfigDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
let ConfigDO = class ConfigDO extends base_entity_1.BaseDO {
    category;
    name;
    key;
    value;
    type;
    visible;
    remark;
};
exports.ConfigDO = ConfigDO;
__decorate([
    (0, typeorm_1.Column)({ name: 'category', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], ConfigDO.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ConfigDO.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'config_key', type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], ConfigDO.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'value', type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], ConfigDO.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], ConfigDO.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'visible', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ConfigDO.prototype, "visible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remark', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ConfigDO.prototype, "remark", void 0);
exports.ConfigDO = ConfigDO = __decorate([
    (0, typeorm_1.Entity)('infra_config')
], ConfigDO);
//# sourceMappingURL=config.entity.js.map