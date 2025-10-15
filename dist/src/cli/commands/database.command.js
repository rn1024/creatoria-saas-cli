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
var DatabaseCommand_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseCommand = void 0;
const common_1 = require("@nestjs/common");
const chalk = __importStar(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const typeorm_1 = require("typeorm");
const config_service_1 = require("../../config/config.service");
let DatabaseCommand = DatabaseCommand_1 = class DatabaseCommand {
    configService;
    logger = new common_1.Logger(DatabaseCommand_1.name);
    dataSource;
    constructor(configService) {
        this.configService = configService;
        this.initDataSource();
    }
    async initDataSource() {
        const dbConfig = this.configService.database;
        this.dataSource = new typeorm_1.DataSource({
            type: dbConfig.type,
            host: dbConfig.host,
            port: dbConfig.port,
            username: dbConfig.username,
            password: dbConfig.password,
            database: dbConfig.database,
            entities: dbConfig.entities,
            migrations: dbConfig.migrations,
        });
    }
    async migrate(options) {
        try {
            console.log(chalk.blue('Running database migrations...'));
            if (!this.dataSource.isInitialized) {
                await this.dataSource.initialize();
            }
            const migrations = await this.dataSource.runMigrations();
            if (migrations.length === 0) {
                console.log(chalk.yellow('No pending migrations'));
            }
            else {
                console.log(chalk.green(`✓ Executed ${migrations.length} migrations:`));
                migrations.forEach(migration => {
                    console.log(chalk.gray(`  - ${migration.name}`));
                });
            }
            await this.dataSource.destroy();
        }
        catch (error) {
            console.error(chalk.red('✗ Migration failed:'), error.message);
            process.exit(1);
        }
    }
    async seed(options) {
        try {
            console.log(chalk.blue('🌱 Running database seeds...'));
            if (!this.dataSource.isInitialized) {
                await this.dataSource.initialize();
            }
            const seedsPath = options.module
                ? `modules/${options.module}/seeds`
                : 'seeds';
            const fullSeedsPath = path.join(process.cwd(), seedsPath);
            if (!await fs.pathExists(fullSeedsPath)) {
                console.log(chalk.yellow(`No seeds directory found at ${seedsPath}`));
                console.log(chalk.gray('Create seed files in the seeds directory:'));
                console.log(chalk.gray('  seeds/'));
                console.log(chalk.gray('    ├── 001-users.seed.ts'));
                console.log(chalk.gray('    ├── 002-roles.seed.ts'));
                console.log(chalk.gray('    └── 003-permissions.seed.ts'));
                return;
            }
            const seedFiles = await fs.readdir(fullSeedsPath);
            const sortedSeedFiles = seedFiles
                .filter(file => file.endsWith('.seed.ts') || file.endsWith('.seed.js'))
                .sort();
            if (sortedSeedFiles.length === 0) {
                console.log(chalk.yellow('No seed files found'));
                return;
            }
            console.log(chalk.gray(`Found ${sortedSeedFiles.length} seed file(s)`));
            if (!options.force) {
                const seedHistory = await this.getSeedHistory();
                const pendingSeeds = sortedSeedFiles.filter(seed => !seedHistory.includes(seed));
                if (pendingSeeds.length === 0) {
                    console.log(chalk.yellow('All seeds have already been executed'));
                    console.log(chalk.gray('Use --force to re-run all seeds'));
                    return;
                }
                console.log(chalk.gray(`${pendingSeeds.length} pending seed(s) to execute`));
            }
            const executedSeeds = [];
            for (const seedFile of sortedSeedFiles) {
                try {
                    console.log(chalk.gray(`  Running: ${seedFile}...`));
                    const seedPath = path.join(fullSeedsPath, seedFile);
                    const seedModule = require(seedPath);
                    const seedFunction = seedModule.default || seedModule.seed;
                    if (typeof seedFunction !== 'function') {
                        console.warn(chalk.yellow(`  ⚠ ${seedFile} does not export a seed function`));
                        continue;
                    }
                    await this.dataSource.transaction(async (manager) => {
                        await seedFunction(manager, this.dataSource);
                    });
                    executedSeeds.push(seedFile);
                    console.log(chalk.green(`  ✓ ${seedFile}`));
                    if (!options.force) {
                        await this.recordSeedExecution(seedFile);
                    }
                }
                catch (error) {
                    console.error(chalk.red(`  ✗ ${seedFile} failed:`), error.message);
                    if (executedSeeds.length > 0) {
                        console.log(chalk.yellow(`Successfully executed ${executedSeeds.length} seed(s) before failure`));
                    }
                    throw error;
                }
            }
            await this.dataSource.destroy();
            console.log(chalk.green(`✓ Successfully executed ${executedSeeds.length} seed(s)`));
        }
        catch (error) {
            console.error(chalk.red('✗ Seeding failed:'), error.message);
            if (this.dataSource?.isInitialized) {
                await this.dataSource.destroy();
            }
            process.exit(1);
        }
    }
    async getSeedHistory() {
        try {
            const tableExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'seed_history'
        );
      `);
            if (!tableExists[0].exists) {
                await this.dataSource.query(`
          CREATE TABLE seed_history (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
                return [];
            }
            const results = await this.dataSource.query('SELECT filename FROM seed_history ORDER BY executed_at');
            return results.map((r) => r.filename);
        }
        catch (error) {
            console.warn(chalk.yellow('Could not read seed history'), error.message);
            return [];
        }
    }
    async recordSeedExecution(filename) {
        try {
            await this.dataSource.query('INSERT INTO seed_history (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
        }
        catch (error) {
            console.warn(chalk.yellow('Could not record seed execution'), error.message);
        }
    }
    async reset(options = {}) {
        try {
            console.log(chalk.yellow('⚠ WARNING: This will delete ALL data in the database!'));
            if (!options.force) {
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
                const answer = await new Promise((resolve) => {
                    rl.question(chalk.red('Are you sure? Type "yes" to confirm: '), (answer) => {
                        rl.close();
                        resolve(answer);
                    });
                });
                if (answer.toLowerCase() !== 'yes') {
                    console.log(chalk.gray('Database reset cancelled'));
                    return;
                }
            }
            if (!this.dataSource.isInitialized) {
                await this.dataSource.initialize();
            }
            console.log(chalk.blue('Dropping database schema...'));
            await this.dataSource.dropDatabase();
            console.log(chalk.blue('Synchronizing database schema...'));
            await this.dataSource.synchronize();
            console.log(chalk.green('✓ Database reset successfully'));
            await this.dataSource.destroy();
        }
        catch (error) {
            console.error(chalk.red('✗ Reset failed:'), error.message);
            if (this.dataSource?.isInitialized) {
                await this.dataSource.destroy();
            }
            process.exit(1);
        }
    }
};
exports.DatabaseCommand = DatabaseCommand;
exports.DatabaseCommand = DatabaseCommand = DatabaseCommand_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], DatabaseCommand);
//# sourceMappingURL=database.command.js.map