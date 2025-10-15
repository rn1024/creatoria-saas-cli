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
exports.TreeBaseDO = exports.BaseDO = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class BaseDO {
    id;
    createdAt;
    updatedAt;
}
exports.BaseDO = BaseDO;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '主键ID',
        type: Number,
        example: 1,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BaseDO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '创建时间',
        type: Date,
        example: '2024-01-01T00:00:00.000Z',
    }),
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp',
        comment: '创建时间',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.toISOString()),
    __metadata("design:type", Date)
], BaseDO.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '更新时间',
        type: Date,
        example: '2024-01-01T00:00:00.000Z',
    }),
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp',
        comment: '更新时间',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.toISOString()),
    __metadata("design:type", Date)
], BaseDO.prototype, "updatedAt", void 0);
class TreeBaseDO extends BaseDO {
    parentId;
    ancestors;
    children;
}
exports.TreeBaseDO = TreeBaseDO;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '父级ID',
        required: false,
        type: Number,
        example: 0,
    }),
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: true,
        comment: '父级ID',
    }),
    __metadata("design:type", Number)
], TreeBaseDO.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '祖级路径',
        required: false,
        example: '0,1,2',
    }),
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '祖级路径',
    }),
    __metadata("design:type", String)
], TreeBaseDO.prototype, "ancestors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '子节点',
        type: [Object],
        required: false,
    }),
    __metadata("design:type", Array)
], TreeBaseDO.prototype, "children", void 0);
//# sourceMappingURL=base.entity.js.map