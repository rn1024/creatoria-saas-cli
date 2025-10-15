import { Command } from 'commander';
import chalk from 'chalk';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';

const execAsync = promisify(exec);

export const dbCommand = new Command('db')
  .description('Database management commands');

dbCommand
  .command('migrate')
  .description('Run database migrations')
  .action(runMigrations);

dbCommand
  .command('seed')
  .description('Seed the database')
  .action(seedDatabase);

async function runMigrations() {
  try {
    console.log(chalk.cyan('\nRunning database migrations...\n'));

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error(chalk.red('Not in a Creatoria project directory'));
      process.exit(1);
    }

    // Run TypeORM migrations
    await execAsync('npm run migration:run', { cwd: process.cwd() });
    console.log(chalk.green('✓ Migrations completed\n'));

  } catch (error: any) {
    console.error(chalk.red('Migration failed:'), error.message);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    console.log(chalk.cyan('\nSeeding database...\n'));

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error(chalk.red('Not in a Creatoria project directory'));
      process.exit(1);
    }

    // Run seed script
    await execAsync('npm run seed', { cwd: process.cwd() });
    console.log(chalk.green('✓ Database seeded\n'));

  } catch (error: any) {
    console.error(chalk.red('Seeding failed:'), error.message);
    process.exit(1);
  }
}
