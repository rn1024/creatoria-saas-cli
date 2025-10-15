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
exports.AreaDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
let AreaDO = class AreaDO extends base_entity_1.BaseEntity {
    name;
    code;
    type;
    latitude;
    longitude;
    sort;
    children;
    parent;
};
exports.AreaDO = AreaDO;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AreaDO.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], AreaDO.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], AreaDO.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AreaDO.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AreaDO.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], AreaDO.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.TreeChildren)(),
    __metadata("design:type", Array)
], AreaDO.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.TreeParent)(),
    __metadata("design:type", AreaDO)
], AreaDO.prototype, "parent", void 0);
exports.AreaDO = AreaDO = __decorate([
    (0, typeorm_1.Entity)('areas'),
    (0, typeorm_1.Tree)('closure-table')
], AreaDO);
//# sourceMappingURL=area.entity.js.map