"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyManagerService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
let DependencyManagerService = class DependencyManagerService {
    featureDependencies = {
        auth: {
            dependencies: {
                '@nestjs/jwt': '^11.0.0',
                '@nestjs/passport': '^11.0.0',
                'passport': '^0.7.0',
                'passport-jwt': '^4.0.1',
                'passport-local': '^1.0.0',
                'bcryptjs': '^2.4.3',
            },
            devDependencies: {
                '@types/passport-jwt': '^4.0.0',
                '@types/passport-local': '^1.0.38',
                '@types/bcryptjs': '^2.4.6',
            },
        },
        redis: {
            dependencies: {
                '@nestjs/cache-manager': '^2.0.0',
                'cache-manager': '^5.0.0',
                'cache-manager-redis-store': '^3.0.0',
                'redis': '^4.0.0',
            },
        },
        swagger: {
            dependencies: {
                '@nestjs/swagger': '^11.0.0',
                'swagger-ui-express': '^5.0.0',
            },
        },
        cors: {
            dependencies: {},
        },
        throttle: {
            dependencies: {
                '@nestjs/throttler': '^7.0.0',
            },
        },
        email: {
            dependencies: {
                '@nestjs-modules/mailer': '^2.0.0',
                'nodemailer': '^6.9.0',
            },
        },
        sms: {
            dependencies: {
                '@alicloud/sms-sdk': '^1.1.6',
            },
        },
        oss: {
            dependencies: {
                'ali-oss': '^6.17.0',
                'aws-sdk': '^2.1400.0',
            },
        },
        elasticsearch: {
            dependencies: {
                '@elastic/elasticsearch': '^8.0.0',
                '@nestjs/elasticsearch': '^10.0.0',
            },
        },
        rabbitmq: {
            dependencies: {
                '@nestjs/microservices': '^11.0.0',
                'amqplib': '^0.10.0',
                'amqp-connection-manager': '^4.1.0',
            },
        },
        minio: {
            dependencies: {
                'minio': '^8.0.0',
            },
        },
        social: {
            dependencies: {
                'passport-github2': '^0.1.12',
                'passport-google-oauth20': '^2.0.0',
                'passport-wechat': '^2.0.0',
            },
        },
        payment: {
            dependencies: {
                'alipay-sdk': '^3.4.0',
                'wechatpay-axios-plugin': '^0.9.0',
            },
        },
    };
    mergeDependencies(features) {
        const result = {
            dependencies: {},
            devDependencies: {},
        };
        for (const feature of features) {
            const deps = this.featureDependencies[feature];
            if (deps) {
                if (deps.dependencies) {
                    Object.assign(result.dependencies, deps.dependencies);
                }
                if (deps.devDependencies) {
                    Object.assign(result.devDependencies, deps.devDependencies);
                }
            }
        }
        return result;
    }
    async updatePackageJson(projectPath, features) {
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('package.json not found');
        }
        const packageJson = await fs.readJson(packageJsonPath);
        const featureDeps = this.mergeDependencies(features);
        if (featureDeps.dependencies) {
            packageJson.dependencies = {
                ...packageJson.dependencies,
                ...featureDeps.dependencies,
            };
        }
        if (featureDeps.devDependencies) {
            packageJson.devDependencies = {
                ...packageJson.devDependencies,
                ...featureDeps.devDependencies,
            };
        }
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
    getRequiredDependencies(features) {
        const deps = this.mergeDependencies(features);
        return [
            ...Object.keys(deps.dependencies || {}),
            ...Object.keys(deps.devDependencies || {}),
        ];
    }
};
exports.DependencyManagerService = DependencyManagerService;
exports.DependencyManagerService = DependencyManagerService = __decorate([
    (0, common_1.Injectable)()
], DependencyManagerService);
//# sourceMappingURL=dependency-manager.service.js.map