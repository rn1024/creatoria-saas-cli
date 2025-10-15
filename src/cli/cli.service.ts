import { Injectable } from '@nestjs/common';
import { Command } from 'commander';
import * as chalk from 'chalk';
import { ModuleCommand } from './commands/module.command';
import { ModuleAddCommand } from './commands/module-add.command';
import { DatabaseCommand } from './commands/database.command';
import { ConfigCommand } from './commands/config.command';
import { CreateCommand } from './commands/create.command';
import { InitCommand } from './commands/init.command';
import { ServerCommand } from './commands/server.command';
import { DockerCommand } from './commands/docker.command';

@Injectable()
export class CliService {
  private program: Command;

  constructor(
    private moduleCommand: ModuleCommand,
    private moduleAddCommand: ModuleAddCommand,
    private databaseCommand: DatabaseCommand,
    private configCommand: ConfigCommand,
    private createCommand: CreateCommand,
    private initCommand: InitCommand,
    private serverCommand: ServerCommand,
    private dockerCommand: DockerCommand,
  ) {
    this.program = new Command();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name('creatoria')
      .description('Creatoria SaaS CLI')
      .version('1.0.0');

    // Module commands
    const module = this.program.command('module');
    module
      .command('add <name>')
      .description('Add a module to the project')
      .option('--skip-deps', 'Skip dependency check')
      .action(async (name, options) => {
        await this.moduleAddCommand.run([name], options);
      });

    module
      .command('install [source]')
      .description('Install modules from remote repository')
      .action(async (source) => {
        await this.moduleCommand.install(source);
      });

    module
      .command('list')
      .description('List all installed modules')
      .action(async () => {
        await this.moduleCommand.list();
      });

    module
      .command('enable <name>')
      .description('Enable a module')
      .action(async (name) => {
        await this.moduleCommand.enable(name);
      });

    module
      .command('disable <name>')
      .description('Disable a module')
      .action(async (name) => {
        await this.moduleCommand.disable(name);
      });

    module
      .command('info <name>')
      .description('Show module information')
      .action(async (name) => {
        await this.moduleCommand.info(name);
      });

    // Database commands
    const db = this.program.command('db');
    db
      .command('migrate')
      .description('Run database migrations')
      .option('--module <module>', 'Run migrations for specific module')
      .action(async (options) => {
        await this.databaseCommand.migrate(options);
      });

    db
      .command('seed')
      .description('Run database seeds')
      .option('--module <module>', 'Run seeds for specific module')
      .option('--force', 'Force re-run all seeds even if already executed')
      .action(async (options) => {
        await this.databaseCommand.seed(options);
      });

    db
      .command('reset')
      .description('Reset database (drops all data and recreates schema)')
      .option('--force', 'Skip confirmation prompt')
      .action(async (options) => {
        await this.databaseCommand.reset(options);
      });

    // Config commands
    const config = this.program.command('config');
    config
      .command('show')
      .description('Show current configuration')
      .action(async () => {
        await this.configCommand.show();
      });

    config
      .command('set <key> <value>')
      .description('Set a configuration value')
      .action(async (key, value) => {
        await this.configCommand.set(key, value);
      });

    // Create command
    this.program
      .command('create <name>')
      .description('Create a new project from the Creatoria template')
      .option('--path <path>', 'Directory where the project will be created')
      .option('--skip-install', 'Skip running npm install')
      .option('--skip-docker', 'Skip starting Docker services')
      .option('--package-manager <manager>', 'Package manager to use (npm, yarn, pnpm)', 'pnpm')
      .option('--features <features>', 'Comma-separated list of features to enable', 'auth,system,database,common,swagger,cors')
      .option('--db-type <type>', 'Database type (postgres, mysql)', 'postgres')
      .option('--db-host <host>', 'Database host', 'localhost')
      .option('--db-port <port>', 'Database port', '5432')
      .option('--db-database <name>', 'Database name')
      .option('--db-username <username>', 'Database username', 'postgres')
      .option('--db-password <password>', 'Database password', 'password')
      .option('--api-prefix <prefix>', 'API route prefix', 'api')
      .option('--admin-prefix <prefix>', 'Admin API route prefix', 'admin-api')
      .option('--system-prefix <prefix>', 'System API route prefix', 'system')
      .option('--app-port <port>', 'Application port', '3000')
      .option('--jwt-secret <secret>', 'JWT secret (auto-generated if not provided)')
      .option('--session-secret <secret>', 'Session secret (auto-generated if not provided)')
      .option('--redis-port <port>', 'Redis port', '6379')
      .option('--redis-password <password>', 'Redis password')
      .option('--rabbitmq-user <user>', 'RabbitMQ username', 'admin')
      .option('--rabbitmq-password <password>', 'RabbitMQ password', 'admin')
      .option('--minio-root-user <user>', 'MinIO root user', 'minioadmin')
      .option('--minio-root-password <password>', 'MinIO root password', 'minioadmin')
      .action(async (name, cmd) => {
        const opts = cmd || {};
        await this.createCommand.run([
          name,
        ], {
          path: opts.path,
          skipInstall: !!opts.skipInstall,
          skipDocker: !!opts.skipDocker,
          packageManager: opts.packageManager,
          features: opts.features ? opts.features.split(',').map((f: string) => f.trim()) : undefined,
          dbType: opts.dbType,
          dbHost: opts.dbHost,
          dbPort: opts.dbPort ? Number(opts.dbPort) : undefined,
          dbDatabase: opts.dbDatabase,
          dbUsername: opts.dbUsername,
          dbPassword: opts.dbPassword,
          apiPrefix: opts.apiPrefix,
          adminPrefix: opts.adminPrefix,
          systemPrefix: opts.systemPrefix,
          appPort: opts.appPort ? Number(opts.appPort) : undefined,
          jwtSecret: opts.jwtSecret,
          sessionSecret: opts.sessionSecret,
          redisPort: opts.redisPort ? Number(opts.redisPort) : undefined,
          redisPassword: opts.redisPassword,
          rabbitmqUser: opts.rabbitmqUser,
          rabbitmqPassword: opts.rabbitmqPassword,
          minioRootUser: opts.minioRootUser,
          minioRootPassword: opts.minioRootPassword,
        });
      });

    // Init command
    this.program
      .command('init')
      .description('Initialize the project and run module initialization scripts')
      .option('--skip-db', 'Skip database migrations')
      .option('--skip-seed', 'Skip seed data')
      .option('--modules <modules>', 'Only initialize specific modules (comma-separated)')
      .action(async (options) => {
        await this.initCommand.run([], options);
      });

    // Start command
    this.program
      .command('start')
      .description('Start the application in production mode')
      .option('-p, --port <port>', 'Port to listen on')
      .option('-e, --env <env>', 'Environment file to use (.env.<env>)')
      .option('-d, --daemon', 'Run as daemon with PM2')
      .option('-w, --workers <n>', 'Number of worker processes (with --daemon)')
      .option('--pid <file>', 'PID file path (with --daemon)')
      .action(async (options) => {
        await this.serverCommand.start({
          port: options.port ? Number(options.port) : undefined,
          env: options.env,
          daemon: options.daemon,
          workers: options.workers ? Number(options.workers) : undefined,
          pid: options.pid,
        });
      });

    // Dev command
    this.program
      .command('dev')
      .description('Start the application in development mode with hot reload')
      .option('-p, --port <port>', 'Port to listen on')
      .option('--no-watch', 'Disable file watching')
      .option('--watch-modules', 'Watch for module changes')
      .option('--debug', 'Enable debug mode')
      .option('--inspect <port>', 'Enable inspector on specific port')
      .action(async (options) => {
        await this.serverCommand.dev({
          port: options.port ? Number(options.port) : undefined,
          watch: options.watch !== false,
          watchModules: options.watchModules,
          debug: options.debug,
          inspect: options.inspect ? Number(options.inspect) : undefined,
        });
      });

    // Stop command
    this.program
      .command('stop')
      .description('Stop the running server')
      .option('--pid <pid>', 'Stop specific process by PID')
      .action(async (options) => {
        await this.serverCommand.stop({
          pid: options.pid,
        });
      });

    // Restart command
    this.program
      .command('restart')
      .description('Restart the server')
      .option('-p, --port <port>', 'Port to listen on')
      .option('-e, --env <env>', 'Environment file to use')
      .action(async (options) => {
        await this.serverCommand.restart({
          port: options.port ? Number(options.port) : undefined,
          env: options.env,
        });
      });

    // Status command
    this.program
      .command('status')
      .description('Show server status')
      .action(async () => {
        await this.serverCommand.status();
      });

    // Docker commands
    const docker = this.program.command('docker');
    
    docker
      .command('init')
      .description('Initialize Docker environment')
      .action(async () => {
        await this.dockerCommand.init();
      });
    
    docker
      .command('build')
      .description('Build Docker images')
      .option('-s, --service <service>', 'Build specific service')
      .action(async (options) => {
        await this.dockerCommand.build(options);
      });
    
    docker
      .command('up')
      .description('Start Docker containers')
      .option('-s, --service <service>', 'Start specific service')
      .option('--no-detach', 'Run in foreground')
      .option('--build', 'Build images before starting')
      .action(async (options) => {
        await this.dockerCommand.up(options);
      });
    
    docker
      .command('down')
      .description('Stop Docker containers')
      .option('--force', 'Remove volumes')
      .action(async (options) => {
        await this.dockerCommand.down(options);
      });
    
    docker
      .command('restart')
      .description('Restart Docker containers')
      .option('-s, --service <service>', 'Restart specific service')
      .action(async (options) => {
        await this.dockerCommand.restart(options);
      });
    
    docker
      .command('logs')
      .description('Show Docker container logs')
      .option('-s, --service <service>', 'Show logs for specific service')
      .option('-t, --tail <lines>', 'Number of lines to show')
      .action(async (options) => {
        await this.dockerCommand.logs({
          service: options.service,
          tail: options.tail ? Number(options.tail) : undefined,
        });
      });
    
    docker
      .command('ps')
      .description('Show Docker container status')
      .action(async () => {
        await this.dockerCommand.ps();
      });
    
    docker
      .command('exec <service> [command...]')
      .description('Execute command in Docker container')
      .option('-u, --user <user>', 'Run as specific user')
      .action(async (service, command, options) => {
        await this.dockerCommand.exec(service, command, options);
      });
    
    docker
      .command('pull')
      .description('Pull Docker images')
      .option('-s, --service <service>', 'Pull image for specific service')
      .action(async (options) => {
        await this.dockerCommand.pull(options);
      });
  }

  async run(): Promise<void> {
    await this.program.parseAsync(process.argv);
  }
}
