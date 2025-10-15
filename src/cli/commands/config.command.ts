import { Injectable } from '@nestjs/common';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class ConfigCommand {
  constructor(private configService: ConfigService) {}

  async show(): Promise<void> {
    console.log(chalk.blue('\nCurrent Configuration:\n'));
    console.log(chalk.gray('─'.repeat(60)));
    
    // App config
    console.log(chalk.cyan('Application:'));
    console.log(`  Name:     ${this.configService.app.name}`);
    console.log(`  Version:  ${this.configService.app.version}`);
    console.log(`  Port:     ${this.configService.app.port}`);
    console.log(`  Prefix:   ${this.configService.app.prefix}`);
    
    // Modules config
    console.log(chalk.cyan('\nModules:'));
    console.log(`  Source:   ${this.configService.modules.source}`);
    console.log(`  Version:  ${this.configService.modules.version}`);
    console.log(`  Enabled:  ${this.configService.modules.enabled.join(', ')}`);
    
    // Database config
    console.log(chalk.cyan('\nDatabase:'));
    console.log(`  Type:     ${this.configService.database.type}`);
    console.log(`  Host:     ${this.configService.database.host}`);
    console.log(`  Port:     ${this.configService.database.port}`);
    console.log(`  Database: ${this.configService.database.database}`);
    
    // Redis config
    console.log(chalk.cyan('\nRedis:'));
    console.log(`  Host:     ${this.configService.redis.host}`);
    console.log(`  Port:     ${this.configService.redis.port}`);
    
    // RabbitMQ config
    console.log(chalk.cyan('\nRabbitMQ:'));
    console.log(`  URL:      ${this.configService.rabbitmq.url}`);
    
    // JWT config
    console.log(chalk.cyan('\nJWT:'));
    console.log(`  Expires:  ${this.configService.jwt.expiresIn}`);
    
    // Swagger config
    console.log(chalk.cyan('\nSwagger:'));
    console.log(`  Enabled:  ${this.configService.swagger.enabled}`);
    console.log(`  Path:     ${this.configService.swagger.path}`);
    
    console.log(chalk.gray('─'.repeat(60)));
  }

  async set(key: string, value: string): Promise<void> {
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (await fs.pathExists(envPath)) {
        envContent = await fs.readFile(envPath, 'utf-8');
      }
      
      // Parse and update env content
      const lines = envContent.split('\n');
      const envKey = key.toUpperCase().replace(/\./g, '_');
      let found = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`${envKey}=`)) {
          lines[i] = `${envKey}=${value}`;
          found = true;
          break;
        }
      }
      
      if (!found) {
        lines.push(`${envKey}=${value}`);
      }
      
      // Write back to file
      await fs.writeFile(envPath, lines.join('\n'));
      
      console.log(chalk.green(`✓ Configuration updated: ${key} = ${value}`));
      console.log(chalk.yellow('Please restart the application for changes to take effect'));
    } catch (error) {
      console.error(chalk.red('✗ Failed to update configuration:'), error.message);
      process.exit(1);
    }
  }

  // Methods for integration tests
  async runShow(args: string[], options: any): Promise<void> {
    await this.show();
  }

  async runGet(args: string[], options: any): Promise<void> {
    const key = args[0];
    if (!key) {
      throw new Error('Configuration key is required');
    }
    
    const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
    const config = await fs.readJSON(configPath);
    
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        throw new Error(`Configuration key ${key} not found`);
      }
    }
    
    console.log(`${key}: ${value}`);
  }

  async runSet(args: string[], options: any): Promise<void> {
    const key = args[0];
    const value = options.value;
    
    if (!key) {
      throw new Error('Configuration key is required');
    }
    if (value === undefined) {
      throw new Error('Configuration value is required');
    }
    
    const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
    const config = await fs.readJSON(configPath);
    
    const keys = key.split('.');
    let target = config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }
    
    // Convert value to appropriate type
    const lastKey = keys[keys.length - 1];
    if (!isNaN(Number(value))) {
      target[lastKey] = Number(value);
    } else if (value === 'true' || value === 'false') {
      target[lastKey] = value === 'true';
    } else {
      target[lastKey] = value;
    }
    
    await fs.writeJSON(configPath, config, { spaces: 2 });
    console.log(chalk.green(`✓ Configuration updated: ${key} = ${value}`));
  }

  async runValidate(args: string[], options: any): Promise<void> {
    const configPath = path.join(process.cwd(), '.creatoria', 'config.json');
    
    if (!await fs.pathExists(configPath)) {
      throw new Error('Configuration file not found');
    }
    
    const config = await fs.readJSON(configPath);
    
    // Basic validation
    if (!config.version) {
      throw new Error('Invalid configuration: missing version field');
    }
    
    if (!config.app && !config.modules) {
      throw new Error('Invalid configuration: validation failed');
    }
    
    console.log(chalk.green('✓ Configuration is valid'));
  }
}