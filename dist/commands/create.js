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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommand = void 0;
const commander_1 = require("commander");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const handlebars_1 = __importDefault(require("handlebars"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const simple_git_1 = __importDefault(require("simple-git"));
const os = __importStar(require("os"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.createCommand = new commander_1.Command('create')
    .description('Create a new Creatoria SaaS project')
    .argument('<project-name>', 'Name of the project to create')
    .option('--skip-install', 'Skip dependency installation')
    .option('--skip-docker', 'Skip Docker services startup')
    .option('--template <source>', 'Template source (github:owner/repo or local path)')
    .action(async (projectName, options) => {
    try {
        await createProject(projectName, options);
    }
    catch (error) {
        console.error(chalk_1.default.red('✗ Error:'), error.message);
        process.exit(1);
    }
});
async function createProject(projectName, options) {
    const spinner = (0, ora_1.default)('Creating project...').start();
    try {
        // Determine target directory
        const targetDir = path.join(process.cwd(), projectName);
        if (fs.existsSync(targetDir)) {
            spinner.fail(`Directory ${projectName} already exists`);
            process.exit(1);
        }
        fs.ensureDirSync(targetDir);
        spinner.text = 'Resolving template...';
        // Resolve template directory
        const templateDir = await resolveTemplate(options.template);
        spinner.succeed(`Using template from: ${templateDir}`);
        // Copy template files
        spinner.start('Copying template files...');
        fs.copySync(templateDir, targetDir, {
            overwrite: true,
            filter: (src) => {
                // Exclude node_modules, .git, dist, and other build artifacts
                const relativePath = path.relative(templateDir, src);
                return !relativePath.match(/^(node_modules|\.git|dist|coverage|\.next|\.nuxt)(\/|$)/);
            }
        });
        spinner.succeed('Template files copied');
        // Process Handlebars templates
        spinner.start('Processing templates...');
        registerHandlebarsHelpers();
        const context = createTemplateContext(projectName, options);
        processHandlebarsTemplates(targetDir, context);
        spinner.succeed('Templates processed');
        // Install dependencies
        if (!options.skipInstall) {
            spinner.start('Installing dependencies...');
            await execAsync('npm install', { cwd: targetDir });
            spinner.succeed('Dependencies installed');
        }
        // Start Docker services
        if (!options.skipDocker && fs.existsSync(path.join(targetDir, 'docker-compose.yml'))) {
            spinner.start('Starting Docker services...');
            try {
                await execAsync('docker-compose up -d', { cwd: targetDir });
                spinner.succeed('Docker services started');
            }
            catch (error) {
                spinner.warn('Failed to start Docker services (you can start them manually)');
            }
        }
        // Success message
        console.log(chalk_1.default.green('\n✨ Project created successfully!\n'));
        console.log(chalk_1.default.cyan('Next steps:'));
        console.log(chalk_1.default.gray(`  cd ${projectName}`));
        console.log(chalk_1.default.gray('  npm run start:dev\n'));
    }
    catch (error) {
        spinner.fail('Project creation failed');
        throw error;
    }
}
async function resolveTemplate(templateSource) {
    // Priority 1: Environment variable
    if (process.env.CREATORIA_TEMPLATE_DIR) {
        const templateDir = process.env.CREATORIA_TEMPLATE_DIR;
        if (fs.existsSync(templateDir)) {
            return templateDir;
        }
        throw new Error(`CREATORIA_TEMPLATE_DIR is set but directory does not exist: ${templateDir}`);
    }
    // Priority 2: Custom template source
    if (templateSource) {
        if (templateSource.startsWith('github:')) {
            return await cloneFromGitHub(templateSource);
        }
        // Local path
        if (fs.existsSync(templateSource)) {
            return templateSource;
        }
        throw new Error(`Template source not found: ${templateSource}`);
    }
    // Priority 3: Check if development environment
    const isDev = isDevelopmentEnvironment();
    if (isDev) {
        const localPaths = [
            '/Users/samuelcn/Documents/Project/creatoria/creatoria-saas-template',
            path.resolve(__dirname, '../../../creatoria-saas-template'),
            path.resolve(process.cwd(), '../creatoria-saas-template'),
        ];
        for (const localPath of localPaths) {
            if (fs.existsSync(localPath)) {
                return localPath;
            }
        }
        throw new Error('Development environment: local template not found');
    }
    // Priority 4: Production - clone from GitHub
    return await cloneFromGitHub('github:rn1024/creatoria-saas-template');
}
function isDevelopmentEnvironment() {
    return process.env.NODE_ENV === 'development' ||
        fs.existsSync(path.resolve(__dirname, '../../src'));
}
async function cloneFromGitHub(templateSource) {
    const repo = templateSource.replace('github:', '');
    const gitUrl = `https://github.com/${repo}.git`;
    const tempDir = path.join(os.tmpdir(), 'creatoria-template', Date.now().toString());
    const git = (0, simple_git_1.default)();
    await git.clone(gitUrl, tempDir, ['--depth', '1']);
    return tempDir;
}
function registerHandlebarsHelpers() {
    handlebars_1.default.registerHelper('eq', (a, b) => a === b);
    handlebars_1.default.registerHelper('includes', (arr, val) => Array.isArray(arr) && arr.includes(val));
    handlebars_1.default.registerHelper('json', (context) => new handlebars_1.default.SafeString(JSON.stringify(context)));
}
function createTemplateContext(projectName, options) {
    return {
        projectName,
        createdAt: new Date().toISOString(),
        features: ['auth', 'system', 'database', 'common', 'swagger', 'cors'],
        dbType: 'postgres',
        dbHost: 'localhost',
        dbPort: 5432,
        dbDatabase: projectName,
        dbUsername: 'postgres',
        dbPassword: 'password',
        apiPrefix: 'api',
        adminPrefix: 'admin-api',
        systemPrefix: 'system',
        appPort: 3000,
        jwtSecret: generateSecret(),
        sessionSecret: generateSecret(),
        redisPort: 6379,
        redisPassword: '',
        rabbitmqUser: 'admin',
        rabbitmqPassword: 'admin',
        minioRootUser: 'minioadmin',
        minioRootPassword: 'minioadmin',
    };
}
function processHandlebarsTemplates(rootDir, context) {
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
                const template = handlebars_1.default.compile(source);
                const rendered = template(context);
                // Write rendered content
                fs.writeFileSync(fullPath, rendered);
                // Rename file (remove .hbs extension)
                const newPath = fullPath.slice(0, -4);
                fs.renameSync(fullPath, newPath);
            }
        }
    };
    walk(rootDir);
}
function generateSecret() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}
//# sourceMappingURL=create.js.map