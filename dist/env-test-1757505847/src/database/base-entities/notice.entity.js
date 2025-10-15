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
exports.NoticeDO = exports.CommonStatusEnum = exports.NoticeTypeEnum = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
const swagger_1 = require("@nestjs/swagger");
var NoticeTypeEnum;
(function (NoticeTypeEnum) {
    NoticeTypeEnum[NoticeTypeEnum["NOTICE"] = 1] = "NOTICE";
    NoticeTypeEnum[NoticeTypeEnum["ANNOUNCEMENT"] = 2] = "ANNOUNCEMENT";
})(NoticeTypeEnum || (exports.NoticeTypeEnum = NoticeTypeEnum = {}));
var CommonStatusEnum;
(function (CommonStatusEnum) {
    CommonStatusEnum[CommonStatusEnum["ENABLE"] = 0] = "ENABLE";
    CommonStatusEnum[CommonStatusEnum["DISABLE"] = 1] = "DISABLE";
})(CommonStatusEnum || (exports.CommonStatusEnum = CommonStatusEnum = {}));
let NoticeDO = class NoticeDO extends base_entity_1.BaseDO {
    title;
    type;
    content;
    status;
};
exports.NoticeDO = NoticeDO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '公告ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', name: 'id' }),
    __metadata("design:type", Number)
], NoticeDO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '公告标题' }),
    (0, typeorm_1.Column)('varchar', { name: 'title', comment: '公告标题', length: 50 }),
    __metadata("design:type", String)
], NoticeDO.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '公告类型' }),
    (0, typeorm_1.Column)('int', { name: 'type', comment: '公告类型' }),
    __metadata("design:type", Number)
], NoticeDO.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '公告内容' }),
    (0, typeorm_1.Column)('text', { name: 'content', comment: '公告内容' }),
    __metadata("design:type", String)
], NoticeDO.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '公告状态' }),
    (0, typeorm_1.Column)('int', { name: 'status', comment: '公告状态' }),
    __metadata("design:type", Number)
], NoticeDO.prototype, "status", void 0);
exports.NoticeDO = NoticeDO = __decorate([
    (0, typeorm_1.Entity)('system_notice')
], NoticeDO);
//# sourceMappingURL=notice.entity.js.map