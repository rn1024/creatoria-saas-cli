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
exports.PostDO = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
const swagger_1 = require("@nestjs/swagger");
let PostDO = class PostDO extends base_entity_1.BaseDO {
    code;
    name;
    sort;
    status;
    remark;
};
exports.PostDO = PostDO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位编码' }),
    (0, typeorm_1.Column)({
        name: 'code',
        type: 'varchar',
        length: 64,
        comment: '岗位编码',
    }),
    __metadata("design:type", String)
], PostDO.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位名称' }),
    (0, typeorm_1.Column)({
        name: 'name',
        type: 'varchar',
        length: 50,
        comment: '岗位名称',
    }),
    __metadata("design:type", String)
], PostDO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '显示顺序' }),
    (0, typeorm_1.Column)({
        name: 'sort',
        type: 'int',
        comment: '显示顺序',
    }),
    __metadata("design:type", Number)
], PostDO.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位状态', enum: [0, 1] }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'smallint',
        comment: '岗位状态（0正常 1停用）',
    }),
    __metadata("design:type", Number)
], PostDO.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', required: false }),
    (0, typeorm_1.Column)({
        name: 'remark',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '备注',
    }),
    __metadata("design:type", String)
], PostDO.prototype, "remark", void 0);
exports.PostDO = PostDO = __decorate([
    (0, typeorm_1.Entity)('system_post')
], PostDO);
//# sourceMappingURL=post.entity.js.map