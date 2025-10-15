import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as chalk from 'chalk';
import ora from 'ora';
import Handlebars from 'handlebars';
import { promisify } from 'util';
import { exec } from 'child_process';
import simpleGit from 'simple-git';
import * as os from 'os';

const execAsync = promisify(exec);

export const createCommand = new Command('create')
  .description('Create a new Creatoria SaaS project')
  .argument('<project-name>', 'Name of the project to create')
  .option('--skip-install', 'Skip dependency installation')
  .option('--skip-docker', 'Skip Docker services startup')
  .option('--template <source>', 'Template source (github:owner/repo or local path)')
  .action(async (projectName: string, options: any) => {
    try {
      await createProject(projectName, options);
    } catch (error: any) {
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

async function createProject(projectName: string, options: any) {
  const spinner = ora('Creating project...').start();

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
    fs.copySync(templateDir, targetDir, { overwrite: true });
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
      } catch (error) {
        spinner.warn('Failed to start Docker services (you can start them manually)');
      }
    }

    // Success message
    console.log(chalk.green('\n✨ Project created successfully!\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray(`  cd ${projectName}`));
    console.log(chalk.gray('  npm run start:dev\n'));

  } catch (error: any) {
    spinner.fail('Project creation failed');
    throw error;
  }
}

async function resolveTemplate(templateSource?: string): Promise<string> {
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

function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development' ||
         fs.existsSync(path.resolve(__dirname, '../../src'));
}

async function cloneFromGitHub(templateSource: string): Promise<string> {
  const repo = templateSource.replace('github:', '');
  const gitUrl = `https://github.com/${repo}.git`;
  const tempDir = path.join(os.tmpdir(), 'creatoria-template', Date.now().toString());

  const git = simpleGit();
  await git.clone(gitUrl, tempDir, ['--depth', '1']);

  return tempDir;
}

function registerHandlebarsHelpers() {
  Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
  Handlebars.registerHelper('includes', (arr: any[], val: any) =>
    Array.isArray(arr) && arr.includes(val)
  );
  Handlebars.registerHelper('json', (context: any) =>
    new Handlebars.SafeString(JSON.stringify(context))
  );
}

function createTemplateContext(projectName: string, options: any) {
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

function processHandlebarsTemplates(rootDir: string, context: any) {
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

function generateSecret(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}
