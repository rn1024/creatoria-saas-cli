"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DocumentationModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationModule = void 0;
const common_1 = require("@nestjs/common");
const api_doc_generator_1 = require("./api/api-doc.generator");
const swagger_config_1 = require("./api/swagger.config");
const documentation_service_1 = require("./documentation.service");
const documentation_controller_1 = require("./documentation.controller");
let DocumentationModule = DocumentationModule_1 = class DocumentationModule {
    static forRoot(options = {}) {
        const providers = [
            api_doc_generator_1.ApiDocGenerator,
            swagger_config_1.SwaggerConfigService,
            documentation_service_1.DocumentationService,
            {
                provide: 'DOCUMENTATION_OPTIONS',
                useValue: {
                    enableSwagger: options.enableSwagger !== false,
                    swaggerPath: options.swaggerPath || 'api-docs',
                    enableApiDocs: options.enableApiDocs !== false,
                    apiDocsPath: options.apiDocsPath || 'docs',
                    generateOnStartup: options.generateOnStartup !== false,
                    autoUpdate: options.autoUpdate || false,
                },
            },
        ];
        const controllers = options.enableApiDocs !== false
            ? [documentation_controller_1.DocumentationController]
            : [];
        return {
            module: DocumentationModule_1,
            providers,
            controllers,
            exports: [
                api_doc_generator_1.ApiDocGenerator,
                swagger_config_1.SwaggerConfigService,
                documentation_service_1.DocumentationService,
            ],
        };
    }
    static forFeature() {
        return {
            module: DocumentationModule_1,
            imports: [],
            exports: [],
        };
    }
};
exports.DocumentationModule = DocumentationModule;
exports.DocumentationModule = DocumentationModule = DocumentationModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], DocumentationModule);
//# sourceMappingURL=documentation.module.js.map