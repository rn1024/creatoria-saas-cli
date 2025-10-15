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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommand = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const util_1 = require("util");
const dependency_manager_service_1 = require("../services/dependency-manager.service");
const Handlebars = require('handlebars');
const { exec } = require('child_process');
const execAsync = (0, util_1.promisify)(exec);
let CreateCommand = class CreateCommand {
    dependencyManager;
    constructor(dependencyManager) {
        this.dependencyManager = dependencyManager;
    }
    async run(args, options = {}) {
        const projectName = args?.[0];
        if (!projectName) {
            throw new Error('Project name is required');
        }
        const targetDir = path.isAbsolute(projectName)
            ? projectName
            : path.join(process.cwd(), projectName);
        if (fs.existsSync(targetDir)) {
            throw new Error(`Directory ${projectName} already exists`);
        }
        fs.ensureDirSync(targetDir);
        const candidates = [
            process.env.CREATORIA_TEMPLATE_DIR,
            '/Users/samuelcn/Documents/Project/creatoria/creatoria-saas-template',
            path.resolve(__dirname, '../../../creatoria-saas-template'),
            path.resolve(process.cwd(), 'creatoria-saas-template'),
            path.resolve(process.cwd(), '..', 'creatoria-saas-template'),
        ].filter(Boolean);
        const templateDir = candidates.find((p) => fs.existsSync(p));
        if (!templateDir) {
            throw new Error('Cannot locate creatoria-saas-template directory. Set CREATORIA_TEMPLATE_DIR to the template path.');
        }
        console.log(`Using template from: ${templateDir}`);
        fs.copySync(templateDir, targetDir, { overwrite: true, errorOnExist: false });
        console.log(`Copied template files to ${targetDir}`);
        const hasAppModuleHbs = fs.existsSync(path.join(targetDir, 'src', 'app.module.ts.hbs'));
        const hasAppModule = fs.existsSync(path.join(targetDir, 'src', 'app.module.ts'));
        console.log(`Has app.module.ts.hbs: ${hasAppModuleHbs}`);
        console.log(`Has app.module.ts: ${hasAppModule}`);
        Handlebars.registerHelper('eq', (a, b) => a === b);
        Handlebars.registerHelper('includes', (arr, v) => Array.isArray(arr) && arr.includes(v));
        Handlebars.registerHelper('json', (context) => {
            return new Handlebars.SafeString(JSON.stringify(context));
        });
        console.log('Received options:', JSON.stringify(options, null, 2));
        const features = options.features || ['auth', 'system', 'database', 'common', 'swagger', 'cors', 'sms', 'social'];
        const context = {
            projectName,
            createdAt: new Date().toISOString(),
            features,
            database: 'PostgreSQL',
            dbType: options.dbType || 'postgres',
            dbHost: options.dbHost || 'localhost',
            dbPort: options.dbPort || 5432,
            dbDatabase: options.dbDatabase || projectName,
            dbUsername: options.dbUsername || 'postgres',
            dbPassword: options.dbPassword || 'password',
            apiPrefix: options.apiPrefix || 'api',
            adminPrefix: options.adminPrefix || 'admin-api',
            systemPrefix: options.systemPrefix || 'system',
            appPort: options.appPort || 3000,
            jwtSecret: options.jwtSecret || this.generateSecret(),
            sessionSecret: options.sessionSecret || this.generateSecret(),
            redisPort: options.redisPort || 6379,
            redisPassword: options.redisPassword || '',
            rabbitmqUser: options.rabbitmqUser || 'admin',
            rabbitmqPassword: options.rabbitmqPassword || 'admin',
            minioRootUser: options.minioRootUser || 'minioadmin',
            minioRootPassword: options.minioRootPassword || 'minioadmin',
        };
        console.log('Template context:', JSON.stringify(context, null, 2));
        this.processHandlebarsTemplates(targetDir, context);
        this.processPackageJson(targetDir, { projectName, createdAt: new Date().toISOString() });
        this.writeEnv(targetDir, options);
        if (features.length > 0 && this.dependencyManager) {
            console.log('Updating dependencies for features:', features);
            await this.dependencyManager.updatePackageJson(targetDir, features);
        }
        if (!options.skipDocker && fs.existsSync(path.join(targetDir, 'docker-compose.yml'))) {
            console.log('Starting Docker services...');
            try {
                await execAsync('docker-compose up -d', { cwd: targetDir });
                console.log('Docker services started successfully');
            }
            catch (error) {
                console.warn('Failed to start Docker services:', error);
                console.log('You can start them manually with: docker-compose up -d');
            }
        }
        if (!options.skipInstall) {
            const packageManager = options.packageManager || 'pnpm';
            console.log(`Installing dependencies with ${packageManager}...`);
            await execAsync(`${packageManager} install`, { cwd: targetDir });
            console.log('Dependencies installed successfully');
        }
        await this.performHealthCheck(targetDir, options);
    }
    processHandlebarsTemplates(root, context) {
        const walk = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walk(fullPath);
                }
                else if (item.endsWith('.hbs')) {
                    const source = fs.readFileSync(fullPath, 'utf-8');
                    const template = Handlebars.compile(source);
                    const rendered = template(context);
                    fs.writeFileSync(fullPath, rendered);
                    const newPath = fullPath.slice(0, -4);
                    if (item === 'app.module.ts.hbs') {
                        console.log('Processing app.module.ts.hbs with context:', JSON.stringify(context, null, 2));
                        console.log('Rendered content preview:', rendered.substring(0, 200));
                    }
                    fs.renameSync(fullPath, newPath);
                }
            }
        };
        walk(root);
    }
    processPackageJson(root, context) {
        try {
            const pkgPath = path.join(root, 'package.json');
            if (!fs.existsSync(pkgPath))
                return;
            const raw = fs.readFileSync(pkgPath, 'utf-8');
            try {
                const template = Handlebars.compile(raw);
                const rendered = template(context);
                fs.writeFileSync(pkgPath, rendered);
            }
            catch {
                const data = JSON.parse(raw);
                if (typeof data.name === 'string') {
                    data.name = data.name.replace('{{projectName}}', context.projectName);
                }
                fs.writeFileSync(pkgPath, JSON.stringify(data, null, 2));
            }
        }
        catch {
        }
    }
    writeEnv(root, options) {
    }
    generateSecret() {
        return require('crypto').randomBytes(32).toString('hex');
    }
    async performHealthCheck(projectPath, options) {
        console.log('\nPerforming health check...');
        const checks = [
            { name: 'package.json', path: 'package.json' },
            { name: '.env', path: '.env' },
            { name: 'Main module', path: 'src/main.ts' },
            { name: 'App module', path: 'src/app.module.ts' },
        ];
        let allPassed = true;
        for (const check of checks) {
            const fullPath = path.join(projectPath, check.path);
            if (fs.existsSync(fullPath)) {
                console.log(`✓ ${check.name}`);
            }
            else {
                console.log(`✗ ${check.name} - Missing`);
                allPassed = false;
            }
        }
        if (allPassed) {
            console.log('\n✨ Project created successfully!');
            console.log(`\nNext steps:`);
            console.log(`  cd ${path.basename(projectPath)}`);
            console.log(`  npm run start:dev`);
            console.log(`\nAPI Documentation: http://localhost:${options.appPort || 3000}/api-docs`);
        }
        else {
            console.warn('\n⚠️ Some files are missing. Please check the project structure.');
        }
    }
};
exports.CreateCommand = CreateCommand;
exports.CreateCommand = CreateCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dependency_manager_service_1.DependencyManagerService])
], CreateCommand);
//# sourceMappingURL=create.command.js.map