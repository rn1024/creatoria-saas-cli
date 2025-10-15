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
exports.SwaggerConfigService = void 0;
const swagger_1 = require("@nestjs/swagger");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class SwaggerConfigService {
    static instance;
    config;
    constructor() {
        this.config = this.loadConfig();
    }
    static getInstance() {
        if (!SwaggerConfigService.instance) {
            SwaggerConfigService.instance = new SwaggerConfigService();
        }
        return SwaggerConfigService.instance;
    }
    loadConfig() {
        const defaultConfig = {
            title: 'Creatoria SaaS CLI API',
            description: 'The Creatoria SaaS CLI API documentation',
            version: '1.0.0',
            tags: [
                'Modules',
                'Configuration',
                'Database',
                'Auth',
                'System',
            ],
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Development server',
                },
                {
                    url: 'https://api.creatoria.com',
                    description: 'Production server',
                },
            ],
            contact: {
                name: 'Creatoria Team',
                email: 'support@creatoria.com',
                url: 'https://creatoria.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        };
        const configPath = path.join(process.cwd(), 'swagger.config.json');
        if (fs.existsSync(configPath)) {
            try {
                const customConfig = fs.readJSONSync(configPath);
                return { ...defaultConfig, ...customConfig };
            }
            catch (error) {
                console.warn('Failed to load swagger.config.json, using defaults');
            }
        }
        return defaultConfig;
    }
    setupSwagger(app) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle(this.config.title)
            .setDescription(this.config.description)
            .setVersion(this.config.version);
        if (this.config.tags) {
            this.config.tags.forEach(tag => {
                config.addTag(tag);
            });
        }
        if (this.config.servers) {
            this.config.servers.forEach(server => {
                config.addServer(server.url, server.description);
            });
        }
        if (this.config.contact) {
            config.setContact(this.config.contact.name, this.config.contact.url, this.config.contact.email);
        }
        if (this.config.license) {
            config.setLicense(this.config.license.name, this.config.license.url);
        }
        config.addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        }, 'access-token');
        config.addApiKey({
            type: 'apiKey',
            name: 'api-key',
            in: 'header',
        }, 'api-key');
        const document = swagger_1.SwaggerModule.createDocument(app, config.build());
        swagger_1.SwaggerModule.setup('api-docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                docExpansion: 'none',
                filter: true,
                showRequestDuration: true,
                syntaxHighlight: {
                    activate: true,
                    theme: 'monokai',
                },
            },
            customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
            customJs: [
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
                'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
            ],
        });
        this.saveDocument(document);
    }
    saveDocument(document) {
        const docsDir = path.join(process.cwd(), 'docs', 'api');
        fs.ensureDirSync(docsDir);
        fs.writeJSONSync(path.join(docsDir, 'openapi.json'), document, { spaces: 2 });
        const yaml = require('js-yaml');
        fs.writeFileSync(path.join(docsDir, 'openapi.yaml'), yaml.dump(document));
        console.log('API documentation saved to docs/api/');
    }
    getConfig() {
        return this.config;
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
}
exports.SwaggerConfigService = SwaggerConfigService;
//# sourceMappingURL=swagger.config.js.map