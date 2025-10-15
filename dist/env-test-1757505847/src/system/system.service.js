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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_entity_1 = require("./entities/config.entity");
const log_entity_1 = require("./entities/log.entity");
let SystemService = class SystemService {
    configRepository;
    logRepository;
    constructor(configRepository, logRepository) {
        this.configRepository = configRepository;
        this.logRepository = logRepository;
    }
    async getConfig(key) {
        const config = await this.configRepository.findOne({ where: { key, enabled: true } });
        return config?.value || null;
    }
    async setConfig(key, value, description) {
        let config = await this.configRepository.findOne({ where: { key } });
        if (config) {
            config.value = value;
            if (description)
                config.description = description;
        }
        else {
            config = this.configRepository.create({ key, value, description });
        }
        return this.configRepository.save(config);
    }
    async getAllConfigs() {
        return this.configRepository.find({ where: { enabled: true } });
    }
    async log(data) {
        const log = this.logRepository.create(data);
        return this.logRepository.save(log);
    }
    async getLogs(query) {
        const qb = this.logRepository.createQueryBuilder('log');
        if (query.userId) {
            qb.andWhere('log.userId = :userId', { userId: query.userId });
        }
        if (query.module) {
            qb.andWhere('log.module = :module', { module: query.module });
        }
        if (query.level) {
            qb.andWhere('log.level = :level', { level: query.level });
        }
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        qb.orderBy('log.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
    async getSystemInfo() {
        return {
            name: 'env-test-1757505847',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
    }
    async healthCheck() {
        const dbConnection = await this.configRepository.query('SELECT 1');
        return {
            status: 'healthy',
            database: dbConnection ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(config_entity_1.SysConfig)),
    __param(1, (0, typeorm_1.InjectRepository)(log_entity_1.SysLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SystemService);
//# sourceMappingURL=system.service.js.map