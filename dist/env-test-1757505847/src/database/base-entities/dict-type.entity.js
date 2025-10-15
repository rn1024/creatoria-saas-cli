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
exports.DictTypeDO = exports.DictStatusEnum = void 0;
const base_entity_1 = require("@app/database/base.entity");
const typeorm_1 = require("typeorm");
var DictStatusEnum;
(function (DictStatusEnum) {
    DictStatusEnum[DictStatusEnum["ENABLE"] = 0] = "ENABLE";
    DictStatusEnum[DictStatusEnum["DISABLE"] = 1] = "DISABLE";
})(DictStatusEnum || (exports.DictStatusEnum = DictStatusEnum = {}));
let DictTypeDO = class DictTypeDO extends base_entity_1.BaseDO {
    name;
    type;
    status;
    remark;
};
exports.DictTypeDO = DictTypeDO;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', name: 'id' }),
    __metadata("design:type", Number)
], DictTypeDO.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { name: 'name', comment: '字典名称', length: 100 }),
    __metadata("design:type", String)
], DictTypeDO.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'type',
        comment: '字典类型',
        length: 100,
        unique: true,
    }),
    __metadata("design:type", String)
], DictTypeDO.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { name: 'status', comment: '状态（1正常 2停用）' }),
    __metadata("design:type", Number)
], DictTypeDO.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'remark',
        comment: '备注',
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], DictTypeDO.prototype, "remark", void 0);
exports.DictTypeDO = DictTypeDO = __decorate([
    (0, typeorm_1.Entity)('system_dict_type')
], DictTypeDO);
//# sourceMappingURL=dict-type.entity.js.map