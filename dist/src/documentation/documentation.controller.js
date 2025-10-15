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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const documentation_service_1 = require("./documentation.service");
const doc_interface_1 = require("./interfaces/doc.interface");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
let DocumentationController = class DocumentationController {
    documentationService;
    constructor(documentationService) {
        this.documentationService = documentationService;
    }
    async getIndex(res) {
        const indexHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Creatoria SaaS CLI Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
        }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 0.5rem; }
        .doc-list { list-style: none; padding: 0; }
        .doc-list li { 
            margin: 1rem 0; 
            padding: 1rem; 
            background: #f8f9fa; 
            border-radius: 0.25rem;
            border-left: 4px solid #007bff;
        }
        .doc-list a { 
            text-decoration: none; 
            color: #007bff; 
            font-weight: 500;
            font-size: 1.1rem;
        }
        .doc-list a:hover { text-decoration: underline; }
        .description { color: #6c757d; margin-top: 0.5rem; }
        .formats { margin-top: 0.5rem; }
        .format-link { 
            display: inline-block; 
            margin-right: 1rem; 
            padding: 0.25rem 0.5rem;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 0.25rem;
            font-size: 0.9rem;
        }
        .format-link:hover { background: #0056b3; }
    </style>
</head>
<body>
    <h1>📚 Creatoria SaaS CLI Documentation</h1>
    
    <ul class="doc-list">
        <li>
            <a href="/docs/api">API Documentation</a>
            <div class="description">Complete API reference with endpoints, parameters, and responses</div>
            <div class="formats">
                <a class="format-link" href="/docs/api?format=json">JSON</a>
                <a class="format-link" href="/docs/api?format=yaml">YAML</a>
                <a class="format-link" href="/docs/api?format=html">HTML</a>
                <a class="format-link" href="/docs/api?format=markdown">Markdown</a>
                <a class="format-link" href="/docs/api?format=postman">Postman</a>
            </div>
        </li>
        
        <li>
            <a href="/docs/guide/user">User Guide</a>
            <div class="description">Getting started guide and command reference</div>
        </li>
        
        <li>
            <a href="/docs/guide/developer">Developer Guide</a>
            <div class="description">Architecture overview and development guidelines</div>
        </li>
        
        <li>
            <a href="/docs/reference/config">Configuration Reference</a>
            <div class="description">Complete configuration options and examples</div>
        </li>
        
        <li>
            <a href="/api-docs">Swagger UI</a>
            <div class="description">Interactive API documentation with testing capabilities</div>
        </li>
    </ul>
    
    <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #dee2e6; color: #6c757d; text-align: center;">
        Generated with Creatoria SaaS CLI Documentation System
    </footer>
</body>
</html>
    `;
        res.type('html').send(indexHtml);
    }
    async getApiDocumentation(format = doc_interface_1.DocumentFormat.HTML, res) {
        const filePath = await this.documentationService.exportDocumentation(format);
        const content = await fs.readFile(filePath, 'utf-8');
        let contentType;
        switch (format) {
            case doc_interface_1.DocumentFormat.JSON:
            case doc_interface_1.DocumentFormat.POSTMAN:
            case doc_interface_1.DocumentFormat.OPENAPI:
                contentType = 'application/json';
                break;
            case doc_interface_1.DocumentFormat.YAML:
                contentType = 'application/x-yaml';
                break;
            case doc_interface_1.DocumentFormat.HTML:
                contentType = 'text/html';
                break;
            case doc_interface_1.DocumentFormat.MARKDOWN:
                contentType = 'text/markdown';
                break;
            default:
                contentType = 'text/plain';
        }
        res.type(contentType).send(content);
    }
    async getGuide(type, res) {
        const guidePath = path.join(process.cwd(), 'docs', 'guides', `${type}-guide.md`);
        if (!await fs.pathExists(guidePath)) {
            await this.documentationService.generateAllDocumentation();
        }
        const content = await fs.readFile(guidePath, 'utf-8');
        const marked = require('marked');
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${type === 'user' ? 'User' : 'Developer'} Guide</title>
    <link href="https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <style>
        body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
        }
        @media (max-width: 767px) {
            body { padding: 15px; }
        }
    </style>
</head>
<body>
    <article class="markdown-body">
        ${marked.parse(content)}
    </article>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-bash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-typescript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-json.min.js"></script>
</body>
</html>
    `;
        res.type('html').send(html);
    }
    async getReference(type, res) {
        const referencePath = path.join(process.cwd(), 'docs', 'references', `${type}-reference.md`);
        if (!await fs.pathExists(referencePath)) {
            await this.documentationService.generateAllDocumentation();
        }
        const content = await fs.readFile(referencePath, 'utf-8');
        const marked = require('marked');
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Configuration Reference</title>
    <link href="https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.min.css" rel="stylesheet">
    <style>
        body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
        }
        .markdown-body table {
            display: table;
            width: 100%;
            overflow: auto;
        }
        @media (max-width: 767px) {
            body { padding: 15px; }
        }
    </style>
</head>
<body>
    <article class="markdown-body">
        ${marked.parse(content)}
    </article>
</body>
</html>
    `;
        res.type('html').send(html);
    }
    async generateDocumentation() {
        await this.documentationService.generateAllDocumentation();
        return {
            success: true,
            message: 'Documentation generated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async downloadDocumentation(format, res) {
        const archiver = require('archiver');
        const docsPath = path.join(process.cwd(), 'docs');
        if (!await fs.pathExists(docsPath)) {
            await this.documentationService.generateAllDocumentation();
        }
        const archive = archiver(format, {
            zlib: { level: 9 },
        });
        const filename = `creatoria-docs-${Date.now()}.${format}`;
        res.attachment(filename);
        archive.pipe(res);
        archive.directory(docsPath, false);
        archive.finalize();
    }
};
exports.DocumentationController = DocumentationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get documentation index' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "getIndex", null);
__decorate([
    (0, common_1.Get)('api'),
    (0, swagger_1.ApiOperation)({ summary: 'Get API documentation' }),
    (0, swagger_1.ApiQuery)({
        name: 'format',
        required: false,
        enum: Object.values(doc_interface_1.DocumentFormat),
        description: 'Output format'
    }),
    __param(0, (0, common_1.Query)('format')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "getApiDocumentation", null);
__decorate([
    (0, common_1.Get)('guide/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get guide documentation' }),
    (0, swagger_1.ApiParam)({ name: 'type', enum: ['user', 'developer'] }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "getGuide", null);
__decorate([
    (0, common_1.Get)('reference/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reference documentation' }),
    (0, swagger_1.ApiParam)({ name: 'type', enum: ['config'] }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "getReference", null);
__decorate([
    (0, common_1.Get)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate all documentation' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "generateDocumentation", null);
__decorate([
    (0, common_1.Get)('download/:format'),
    (0, swagger_1.ApiOperation)({ summary: 'Download documentation archive' }),
    (0, swagger_1.ApiParam)({ name: 'format', enum: ['zip', 'tar'] }),
    __param(0, (0, common_1.Param)('format')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "downloadDocumentation", null);
exports.DocumentationController = DocumentationController = __decorate([
    (0, swagger_1.ApiTags)('Documentation'),
    (0, common_1.Controller)('docs'),
    __metadata("design:paramtypes", [documentation_service_1.DocumentationService])
], DocumentationController);
//# sourceMappingURL=documentation.controller.js.map