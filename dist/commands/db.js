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
exports.dbCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.dbCommand = new commander_1.Command('db')
    .description('Database management commands');
exports.dbCommand
    .command('migrate')
    .description('Run database migrations')
    .action(runMigrations);
exports.dbCommand
    .command('seed')
    .description('Seed the database')
    .action(seedDatabase);
async function runMigrations() {
    try {
        console.log(chalk_1.default.cyan('\nRunning database migrations...\n'));
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            console.error(chalk_1.default.red('Not in a Creatoria project directory'));
            process.exit(1);
        }
        // Run TypeORM migrations
        await execAsync('npm run migration:run', { cwd: process.cwd() });
        console.log(chalk_1.default.green('✓ Migrations completed\n'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Migration failed:'), error.message);
        process.exit(1);
    }
}
async function seedDatabase() {
    try {
        console.log(chalk_1.default.cyan('\nSeeding database...\n'));
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            console.error(chalk_1.default.red('Not in a Creatoria project directory'));
            process.exit(1);
        }
        // Run seed script
        await execAsync('npm run seed', { cwd: process.cwd() });
        console.log(chalk_1.default.green('✓ Database seeded\n'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Seeding failed:'), error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=db.js.map