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
exports.DictDataDO = exports.DictDataStatusEnum = void 0;
const base_entity_1 = require("@app/database/base.entity");
const typeorm_1 = require("typeorm");
var DictDataStatusEnum;
(function (DictDataStatusEnum) {
    DictDataStatusEnum[DictDataStatusEnum["ENABLE"] = 0] = "ENABLE";
    DictDataStatusEnum[DictDataStatusEnum["DISABLE"] = 1] = "DISABLE";
})(DictDataStatusEnum || (exports.DictDataStatusEnum = DictDataStatusEnum = {}));
let DictDataDO = class DictDataDO extends base_entity_1.BaseDO {
    sort;
    label;
    value;
    dictType;
    status;
    colorType;
    cssClass;
    remark;
};
exports.DictDataDO = DictDataDO;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', name: 'id' }),
    __metadata("design:type", Number)
], DictDataDO.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { name: 'sort', comment: '字典排序' }),
    __metadata("design:type", Number)
], DictDataDO.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { name: 'label', comment: '字典标签', length: 100 }),
    __metadata("design:type", String)
], DictDataDO.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { name: 'value', comment: '字典键值', length: 100 }),
    __metadata("design:type", String)
], DictDataDO.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { name: 'dict_type', comment: '字典类型', length: 100 }),
    __metadata("design:type", String)
], DictDataDO.prototype, "dictType", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { name: 'status', comment: '状态（1正常 2停用）' }),
    __metadata("design:type", Number)
], DictDataDO.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'color_type',
        comment: '颜色类型',
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], DictDataDO.prototype, "colorType", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'css_class',
        comment: 'css样式',
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], DictDataDO.prototype, "cssClass", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'remark',
        comment: '备注',
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], DictDataDO.prototype, "remark", void 0);
exports.DictDataDO = DictDataDO = __decorate([
    (0, typeorm_1.Entity)('system_dict_data')
], DictDataDO);
//# sourceMappingURL=dict-data.entity.js.map