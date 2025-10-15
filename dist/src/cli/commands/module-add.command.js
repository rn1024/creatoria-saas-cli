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
exports.ModuleAddCommand = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const dependency_checker_1 = require("../utils/dependency-checker");
const ast_helper_1 = require("../utils/ast-helper");
const exceptions_1 = require("../../common/exceptions");
const catch_errors_decorator_1 = require("../../common/decorators/catch-errors.decorator");
const error_handler_1 = require("../../common/utils/error-handler");
const chalk = require('chalk');
let ModuleAddCommand = class ModuleAddCommand {
    async run(args, options) {
        const moduleName = args[0];
        const skipDependencyCheck = options.skipDeps || false;
        if (!moduleName) {
            throw new exceptions_1.InvalidArgumentException('module-name', 'Module name is required');
        }
        console.log(chalk.blue(`Adding module: ${moduleName}`));
        const configPath = path.resolve(process.cwd(), 'creatoria.config.json');
        if (!await error_handler_1.FileSystemErrorHandler.exists(configPath)) {
            throw new exceptions_1.ProjectNotFoundException(process.cwd());
        }
        const modulesRepoPath = process.env.CREATORIA_MODULES_DIR ||
            path.resolve(__dirname, '../../../../../creatoria-saas-modules');
        const source = path.join(modulesRepoPath, 'packages', moduleName);
        const target = path.resolve(process.cwd(), 'src/modules', moduleName);
        if (!await error_handler_1.FileSystemErrorHandler.exists(source)) {
            throw new exceptions_1.ModuleNotFoundException(moduleName, modulesRepoPath);
        }
        if (await error_handler_1.FileSystemErrorHandler.exists(target)) {
            throw new exceptions_1.ModuleAlreadyExistsException(moduleName);
        }
        if (!skipDependencyCheck) {
            console.log(chalk.gray('Checking module dependencies...'));
            const depChecker = new dependency_checker_1.DependencyChecker(process.cwd(), modulesRepoPath);
            await depChecker.initialize();
            const checkResult = await depChecker.checkDependencies(moduleName);
            depChecker.printDependencyReport(moduleName, checkResult);
            if (!checkResult.valid) {
                if (checkResult.missingModules.length > 0) {
                    console.log(chalk.yellow('\n提示: 使用 --skip-deps 参数可以跳过依赖检查'));
                }
                process.exit(1);
            }
        }
        console.log(chalk.gray(`Copying module files from ${source}...`));
        try {
            await fs.copy(source, target, {
                filter: (src) => {
                    const basename = path.basename(src);
                    return !basename.includes('node_modules') &&
                        !basename.includes('.git') &&
                        !basename.includes('dist');
                }
            });
        }
        catch (error) {
            throw new exceptions_1.ModuleCopyFailedException(moduleName, source, target, error.message);
        }
        console.log(chalk.green(`✅ Module ${moduleName} copied to src/modules/`));
        const config = await error_handler_1.JsonErrorHandler.safeReadJson(configPath);
        if (!config.modules) {
            config.modules = [];
        }
        if (!config.modules.includes(moduleName)) {
            config.modules.push(moduleName);
            await error_handler_1.JsonErrorHandler.safeWriteJson(configPath, config);
            console.log(chalk.green(`✅ Added ${moduleName} to creatoria.config.json`));
        }
        const appModulePath = path.resolve(process.cwd(), 'src/app.module.ts');
        if (await error_handler_1.FileSystemErrorHandler.exists(appModulePath)) {
            const astHelper = new ast_helper_1.AstHelper();
            const success = await astHelper.addModuleToAppModule(appModulePath, moduleName);
            if (!success) {
                const moduleClassName = this.capitalize(moduleName) + 'Module';
                const modulePath = `./modules/${moduleName}/${moduleName}.module`;
                console.log(chalk.yellow(`
⚠️  Automatic registration failed. Manual steps required:

1. Add import to src/app.module.ts:
   ${chalk.cyan(`import { ${moduleClassName} } from '${modulePath}';`)}
   
2. Add to imports array in @Module decorator:
   ${chalk.cyan(`${moduleClassName},`)}
`));
            }
        }
        else {
            console.log(chalk.yellow('⚠️  app.module.ts not found. Please manually register the module.'));
        }
        const moduleJsonPath = path.join(target, 'module.json');
        let hasNpmDependencies = false;
        if (await error_handler_1.FileSystemErrorHandler.exists(moduleJsonPath)) {
            const moduleJson = await error_handler_1.JsonErrorHandler.safeReadJson(moduleJsonPath);
            if (moduleJson.dependencies && moduleJson.dependencies.packages) {
                const packages = Object.keys(moduleJson.dependencies.packages);
                if (packages.length > 0) {
                    hasNpmDependencies = true;
                    console.log(chalk.yellow('\n📦 This module requires the following npm packages:'));
                    packages.forEach(pkg => {
                        console.log(chalk.gray(`   - ${pkg}@${moduleJson.dependencies.packages[pkg]}`));
                    });
                }
            }
        }
        console.log(chalk.green(`
✨ Module ${moduleName} has been successfully added!

Next steps:
${hasNpmDependencies ? chalk.cyan('1. Install dependencies: npm install') : ''}
${hasNpmDependencies ? '2. ' : '1. '}Run the application: ${chalk.cyan('npm run start:dev')}
`));
    }
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
exports.ModuleAddCommand = ModuleAddCommand;
__decorate([
    (0, catch_errors_decorator_1.CatchErrors)({ rethrow: false }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], ModuleAddCommand.prototype, "run", null);
exports.ModuleAddCommand = ModuleAddCommand = __decorate([
    (0, common_1.Injectable)()
], ModuleAddCommand);
//# sourceMappingURL=module-add.command.js.map