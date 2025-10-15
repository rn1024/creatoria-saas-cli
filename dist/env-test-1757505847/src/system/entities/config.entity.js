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
exports.SysConfig = void 0;
const typeorm_1 = require("typeorm");
let SysConfig = class SysConfig {
    id;
    key;
    value;
    description;
    type;
    enabled;
    createdAt;
    updatedAt;
};
exports.SysConfig = SysConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SysConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '配置键' }),
    __metadata("design:type", String)
], SysConfig.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: '配置值' }),
    __metadata("design:type", String)
], SysConfig.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '配置描述' }),
    __metadata("design:type", String)
], SysConfig.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'string', comment: '配置类型' }),
    __metadata("design:type", String)
], SysConfig.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, comment: '是否启用' }),
    __metadata("design:type", Boolean)
], SysConfig.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", Date)
], SysConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '更新时间' }),
    __metadata("design:type", Date)
], SysConfig.prototype, "updatedAt", void 0);
exports.SysConfig = SysConfig = __decorate([
    (0, typeorm_1.Entity)('sys_config'),
    (0, typeorm_1.Index)(['key'], { unique: true })
], SysConfig);
//# sourceMappingURL=config.entity.js.map