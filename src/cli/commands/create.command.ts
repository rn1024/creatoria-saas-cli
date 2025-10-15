import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs-extra';
import { promisify } from 'util';
import { DependencyManagerService } from '../services/dependency-manager.service';

// Use require to avoid type deps for handlebars
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Handlebars = require('handlebars');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exec } = require('child_process');

const execAsync = promisify(exec);

interface CreateOptions {
  skipInstall?: boolean;
  path?: string;  // 添加path参数，用于指定项目创建位置
  dbHost?: string;
  dbPort?: number;
  dbDatabase?: string;
  dbUsername?: string;
  dbPassword?: string;
  dbType?: string;
  apiPrefix?: string;
  adminPrefix?: string;
  systemPrefix?: string;
  appPort?: number;
  jwtSecret?: string;
  sessionSecret?: string;
  features?: string[];
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  skipDocker?: boolean;
  redisPort?: number;
  redisPassword?: string;
  rabbitmqUser?: string;
  rabbitmqPassword?: string;
  minioRootUser?: string;
  minioRootPassword?: string;
}

@Injectable()
export class CreateCommand {
  constructor(
    private readonly dependencyManager: DependencyManagerService,
  ) {}
  /**
   * Create a new project from the template repository
   */
  async run(args: string[], options: CreateOptions = {}): Promise<void> {
    const projectName = args?.[0];
    if (!projectName) {
      throw new Error('Project name is required');
    }

    // 正确处理path参数
    let targetDir: string;
    if (options.path) {
      // 如果指定了path，在该路径下创建项目
      const basePath = path.isAbsolute(options.path) 
        ? options.path 
        : path.join(process.cwd(), options.path);
      // 确保基础路径存在
      fs.ensureDirSync(basePath);
      targetDir = path.join(basePath, projectName);
    } else if (path.isAbsolute(projectName)) {
      // 如果项目名是绝对路径，直接使用
      targetDir = projectName;
    } else {
      // 默认在当前目录创建
      targetDir = path.join(process.cwd(), projectName);
    }

    if (fs.existsSync(targetDir)) {
      throw new Error(`Directory ${projectName} already exists`);
    }

    // Ensure target directory
    fs.ensureDirSync(targetDir);

    // Resolve template directory (assume sibling repo path by default)
    // Users can adjust this logic later; tests mock fs.copySync so source isn't asserted
    const candidates = [
      process.env.CREATORIA_TEMPLATE_DIR,
      // Primary template location
      '/Users/samuelcn/Documents/Project/creatoria/creatoria-saas-template',
      // monorepo layout: repoRoot/creatoria-saas-template
      path.resolve(__dirname, '../../../creatoria-saas-template'),
      // running from repo root
      path.resolve(process.cwd(), 'creatoria-saas-template'),
      // running from cli dir
      path.resolve(process.cwd(), '..', 'creatoria-saas-template'),
    ].filter(Boolean) as string[];

    const templateDir = candidates.find((p) => fs.existsSync(p));
    if (!templateDir) {
      throw new Error('Cannot locate creatoria-saas-template directory. Set CREATORIA_TEMPLATE_DIR to the template path.');
    }
    
    console.log(`Using template from: ${templateDir}`);

    // Copy all template files
    fs.copySync(templateDir, targetDir, { overwrite: true, errorOnExist: false });

    // Log what we copied
    console.log(`Copied template files to ${targetDir}`);
    const hasAppModuleHbs = fs.existsSync(path.join(targetDir, 'src', 'app.module.ts.hbs'));
    const hasAppModule = fs.existsSync(path.join(targetDir, 'src', 'app.module.ts'));
    console.log(`Has app.module.ts.hbs: ${hasAppModuleHbs}`);
    console.log(`Has app.module.ts: ${hasAppModule}`);

    // Render handlebars templates (*.hbs) and rename to remove extension
    // Register basic helpers used by template
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    Handlebars.registerHelper('includes', (arr: any, v: any) => Array.isArray(arr) && arr.includes(v));
    Handlebars.registerHelper('json', (context: any) => {
      // Use Handlebars.SafeString to prevent HTML escaping of JSON
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

    // Ensure package.json has project name replaced if it contained placeholders
    this.processPackageJson(targetDir, { projectName, createdAt: new Date().toISOString() });

    // Write .env with DB config
    this.writeEnv(targetDir, options);

    // Update package.json with feature dependencies
    if (features.length > 0 && this.dependencyManager) {
      console.log('Updating dependencies for features:', features);
      await this.dependencyManager.updatePackageJson(targetDir, features);
    }

    // Start Docker services unless skipped
    if (!options.skipDocker && fs.existsSync(path.join(targetDir, 'docker-compose.yml'))) {
      console.log('Starting Docker services...');
      try {
        await execAsync('docker-compose up -d', { cwd: targetDir });
        console.log('Docker services started successfully');
      } catch (error) {
        console.warn('Failed to start Docker services:', error);
        console.log('You can start them manually with: docker-compose up -d');
      }
    }

    // Install deps unless skipped
    if (!options.skipInstall) {
      const packageManager = options.packageManager || 'pnpm';
      console.log(`Installing dependencies with ${packageManager}...`);
      await execAsync(`${packageManager} install`, { cwd: targetDir });
      console.log('Dependencies installed successfully');
    }

    // Run initial health check
    await this.performHealthCheck(targetDir, options);
  }

  private processHandlebarsTemplates(root: string, context: Record<string, any>) {
    const walk = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (item.endsWith('.hbs')) {
          const source = fs.readFileSync(fullPath, 'utf-8');
          const template = Handlebars.compile(source);
          const rendered = template(context);
          fs.writeFileSync(fullPath, rendered);
          const newPath = fullPath.slice(0, -4); // remove .hbs
          
          // Debug logging
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

  private processPackageJson(root: string, context: Record<string, any>) {
    try {
      const pkgPath = path.join(root, 'package.json');
      if (!fs.existsSync(pkgPath)) return;
      const raw = fs.readFileSync(pkgPath, 'utf-8');
      // Support both pure JSON and JSON with handlebars placeholders
      try {
        // Try handlebars first
        const template = Handlebars.compile(raw);
        const rendered = template(context);
        fs.writeFileSync(pkgPath, rendered);
      } catch {
        // Fallback: JSON parse and replace simple placeholders if any
        const data = JSON.parse(raw);
        if (typeof data.name === 'string') {
          data.name = data.name.replace('{{projectName}}', context.projectName);
        }
        fs.writeFileSync(pkgPath, JSON.stringify(data, null, 2));
      }
    } catch {
      // Best-effort only; ignore package.json processing errors
    }
  }

  private writeEnv(root: string, options: CreateOptions) {
    // .env is now generated from .env.hbs template
    // This method is kept for backward compatibility
    // The actual env configuration is handled by Handlebars templates
  }

  private generateSecret(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  private async performHealthCheck(projectPath: string, options: CreateOptions): Promise<void> {
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
      } else {
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
    } else {
      console.warn('\n⚠️ Some files are missing. Please check the project structure.');
    }
  }
}
