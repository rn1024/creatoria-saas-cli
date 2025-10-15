import { Injectable, Logger } from '@nestjs/common';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class DatabaseCommand {
  private readonly logger = new Logger(DatabaseCommand.name);
  private dataSource: DataSource;

  constructor(private configService: ConfigService) {
    this.initDataSource();
  }

  private async initDataSource(): Promise<void> {
    const dbConfig = this.configService.database;
    this.dataSource = new DataSource({
      type: dbConfig.type as any,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      entities: dbConfig.entities,
      migrations: dbConfig.migrations,
    });
  }

  async migrate(options: { module?: string }): Promise<void> {
    try {
      console.log(chalk.blue('Running database migrations...'));
      
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      const migrations = await this.dataSource.runMigrations();
      
      if (migrations.length === 0) {
        console.log(chalk.yellow('No pending migrations'));
      } else {
        console.log(chalk.green(`✓ Executed ${migrations.length} migrations:`));
        migrations.forEach(migration => {
          console.log(chalk.gray(`  - ${migration.name}`));
        });
      }

      await this.dataSource.destroy();
    } catch (error) {
      console.error(chalk.red('✗ Migration failed:'), error.message);
      process.exit(1);
    }
  }

  async seed(options: { module?: string; force?: boolean }): Promise<void> {
    try {
      console.log(chalk.blue('🌱 Running database seeds...'));
      
      // Initialize data source if not already done
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      // Get seed files path
      const seedsPath = options.module 
        ? `modules/${options.module}/seeds`
        : 'seeds';
      
      const fullSeedsPath = path.join(process.cwd(), seedsPath);
      
      // Check if seeds directory exists
      if (!await fs.pathExists(fullSeedsPath)) {
        console.log(chalk.yellow(`No seeds directory found at ${seedsPath}`));
        console.log(chalk.gray('Create seed files in the seeds directory:'));
        console.log(chalk.gray('  seeds/'));
        console.log(chalk.gray('    ├── 001-users.seed.ts'));
        console.log(chalk.gray('    ├── 002-roles.seed.ts'));
        console.log(chalk.gray('    └── 003-permissions.seed.ts'));
        return;
      }

      // Get all seed files
      const seedFiles = await fs.readdir(fullSeedsPath);
      const sortedSeedFiles = seedFiles
        .filter(file => file.endsWith('.seed.ts') || file.endsWith('.seed.js'))
        .sort(); // Seeds are executed in alphabetical order

      if (sortedSeedFiles.length === 0) {
        console.log(chalk.yellow('No seed files found'));
        return;
      }

      console.log(chalk.gray(`Found ${sortedSeedFiles.length} seed file(s)`));

      // Check if seeds have already been run (unless force flag is set)
      if (!options.force) {
        const seedHistory = await this.getSeedHistory();
        const pendingSeeds = sortedSeedFiles.filter(
          seed => !seedHistory.includes(seed)
        );

        if (pendingSeeds.length === 0) {
          console.log(chalk.yellow('All seeds have already been executed'));
          console.log(chalk.gray('Use --force to re-run all seeds'));
          return;
        }

        console.log(chalk.gray(`${pendingSeeds.length} pending seed(s) to execute`));
      }

      // Execute each seed file
      const executedSeeds: string[] = [];
      
      for (const seedFile of sortedSeedFiles) {
        try {
          console.log(chalk.gray(`  Running: ${seedFile}...`));
          
          const seedPath = path.join(fullSeedsPath, seedFile);
          const seedModule = require(seedPath);
          
          // Seeds should export a default function or a 'seed' function
          const seedFunction = seedModule.default || seedModule.seed;
          
          if (typeof seedFunction !== 'function') {
            console.warn(chalk.yellow(`  ⚠ ${seedFile} does not export a seed function`));
            continue;
          }

          // Execute seed in a transaction
          await this.dataSource.transaction(async manager => {
            await seedFunction(manager, this.dataSource);
          });

          executedSeeds.push(seedFile);
          console.log(chalk.green(`  ✓ ${seedFile}`));
          
          // Record seed execution
          if (!options.force) {
            await this.recordSeedExecution(seedFile);
          }
        } catch (error) {
          console.error(chalk.red(`  ✗ ${seedFile} failed:`), error.message);
          
          // Rollback and stop on first error
          if (executedSeeds.length > 0) {
            console.log(chalk.yellow(`Successfully executed ${executedSeeds.length} seed(s) before failure`));
          }
          throw error;
        }
      }

      await this.dataSource.destroy();
      
      console.log(chalk.green(`✓ Successfully executed ${executedSeeds.length} seed(s)`));
    } catch (error) {
      console.error(chalk.red('✗ Seeding failed:'), error.message);
      if (this.dataSource?.isInitialized) {
        await this.dataSource.destroy();
      }
      process.exit(1);
    }
  }

  /**
   * Get seed execution history
   */
  private async getSeedHistory(): Promise<string[]> {
    try {
      // Check if seed_history table exists
      const tableExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'seed_history'
        );
      `);

      if (!tableExists[0].exists) {
        // Create seed history table
        await this.dataSource.query(`
          CREATE TABLE seed_history (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        return [];
      }

      // Get executed seeds
      const results = await this.dataSource.query(
        'SELECT filename FROM seed_history ORDER BY executed_at'
      );
      
      return results.map((r: any) => r.filename);
    } catch (error) {
      console.warn(chalk.yellow('Could not read seed history'), error.message);
      return [];
    }
  }

  /**
   * Record seed execution
   */
  private async recordSeedExecution(filename: string): Promise<void> {
    try {
      await this.dataSource.query(
        'INSERT INTO seed_history (filename) VALUES ($1) ON CONFLICT DO NOTHING',
        [filename]
      );
    } catch (error) {
      console.warn(chalk.yellow('Could not record seed execution'), error.message);
    }
  }

  async reset(options: { force?: boolean } = {}): Promise<void> {
    try {
      console.log(chalk.yellow('⚠ WARNING: This will delete ALL data in the database!'));
      
      // Require confirmation unless --force is used
      if (!options.force) {
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const answer = await new Promise<string>((resolve) => {
          rl.question(
            chalk.red('Are you sure? Type "yes" to confirm: '),
            (answer: string) => {
              rl.close();
              resolve(answer);
            }
          );
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
    } catch (error) {
      console.error(chalk.red('✗ Reset failed:'), error.message);
      if (this.dataSource?.isInitialized) {
        await this.dataSource.destroy();
      }
      process.exit(1);
    }
  }
}