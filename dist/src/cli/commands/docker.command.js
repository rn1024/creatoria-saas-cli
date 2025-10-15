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
var DockerCommand_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerCommand = void 0;
const common_1 = require("@nestjs/common");
const chalk = __importStar(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
let DockerCommand = DockerCommand_1 = class DockerCommand {
    logger = new common_1.Logger(DockerCommand_1.name);
    async build(options = {}) {
        try {
            console.log(chalk.blue('🐳 Building Docker images...'));
            const composePath = await this.findComposeFile();
            if (!composePath) {
                throw new Error('docker-compose.yml not found');
            }
            const args = ['build'];
            if (options.service) {
                args.push(options.service);
                console.log(chalk.gray(`Building service: ${options.service}`));
            }
            else {
                console.log(chalk.gray('Building all services...'));
            }
            await this.runDockerCompose(args, composePath);
            console.log(chalk.green('✓ Docker images built successfully'));
        }
        catch (error) {
            console.error(chalk.red('✗ Docker build failed:'), error.message);
            process.exit(1);
        }
    }
    async up(options = {}) {
        try {
            console.log(chalk.blue('🚀 Starting Docker containers...'));
            const composePath = await this.findComposeFile();
            if (!composePath) {
                throw new Error('docker-compose.yml not found');
            }
            const args = ['up'];
            if (options.detach !== false) {
                args.push('-d');
            }
            if (options.build) {
                args.push('--build');
            }
            if (options.service) {
                args.push(options.service);
                console.log(chalk.gray(`Starting service: ${options.service}`));
            }
            else {
                console.log(chalk.gray('Starting all services...'));
            }
            await this.runDockerCompose(args, composePath);
            if (options.detach !== false) {
                console.log(chalk.green('✓ Docker containers started in background'));
                console.log(chalk.gray('Use "creatoria-saas docker logs" to view logs'));
                console.log(chalk.gray('Use "creatoria-saas docker ps" to view status'));
            }
        }
        catch (error) {
            console.error(chalk.red('✗ Docker up failed:'), error.message);
            process.exit(1);
        }
    }
    async down(options = {}) {
        try {
            console.log(chalk.yellow('⏹ Stopping Docker containers...'));
            const composePath = await this.findComposeFile();
            if (!composePath) {
                throw new Error('docker-compose.yml not found');
            }
            const args = ['down'];
            if (options.force) {
                args.push('-v');
                console.log(chalk.yellow('Removing volumes...'));
            }
            await this.runDockerCompose(args, composePath);
            console.log(chalk.green('✓ Docker containers stopped'));
        }
        catch (error) {
            console.error(chalk.red('✗ Docker down failed:'), error.message);
            process.exit(1);
        }
    }
    async restart(options = {}) {
        try {
            console.log(chalk.yellow('🔄 Restarting Docker containers...'));
            const composePath = await this.findComposeFile();
            if (!composePath) {
                throw new Error('docker-compose.yml not found');
            }
            const args = ['restart'];
            if (options.service) {
                args.push(options.service);
                console.log(chalk.gray(`Restarting service: ${options.service}`));
            }
            else {
                console.log(chalk.gray('Restarting all services...'));
            }
            await this.runDockerCompose(args, composePath);
            console.log(chalk.green('✓ Docker containers restarted'));
        }
        catch (error) {
            console.error(chalk.red('✗ Docker restart failed:'), error.message);
            process.exit(1);
        }
    }
    async logs(options = {}) {
        try {
            const composePath = await this.findComposeFile();
            if (!composePath) {
                throw new Error('docker-compose.yml not found');
            }
            const args = ['logs'];
            if (options.tail) {
                args.push('--tail', String(options.tail));
            }
            args.push('-f');
            if (options.service) {
                args.push(options.service);
                console.log(chalk.blue(`📋 Showing logs for ${options.service}...`));
            }
            else {
                console.log(chalk.blue('📋 Showing logs for all services...'));
            }
            console.log(chalk.gray('Press Ctrl+C to stop'));
            console.log(chalk.gray('─'.repeat(60)));
            await this.runDockerCompose(args, composePath, true);
        }
        catch (error) {
            if (error.signal !== 'SIGINT') {
                console.error(chalk.red('✗ Docker logs failed:'), error.message);
                process.exit(1);
            }
        }
    }
    async ps(options = {}) {
        try {
            const composePath = await this.findComposeFile();
            if (!composePath) {
                throw new Error('docker-compose.yml not found');
            }
            console.log(chalk.blue('🐳 Docker container status:'));
            console.log(chalk.gray('─'.repeat(60)));
            const args = ['ps'];
            await this.runDockerCompose(args, composePath, true);
        }
        catch (error) {
            console.error(chalk.red('✗ Docker ps failed:'), error.message);
            process.exit(1);
        }
    }
    async exec(service, command, options = {}) {
        try {
            const composePath = await this.findComposeFile();
            if (!composePath) {
                throw new Error('docker-compose.yml not found');
            }
            const args = ['exec'];
            if (options.user) {
                args.push('-u', options.user);
            }
            args.push(service, ...command);
            console.log(chalk.blue(`Executing in ${service}: ${command.join(' ')}`));
            await this.runDockerCompose(args, composePath, true);
        }
        catch (error) {
            console.error(chalk.red('✗ Docker exec failed:'), error.message);
            process.exit(1);
        }
    }
    async pull(options = {}) {
        try {
            console.log(chalk.blue('⬇️ Pulling Docker images...'));
            const composePath = await this.findComposeFile();
            if (!composePath) {
                throw new Error('docker-compose.yml not found');
            }
            const args = ['pull'];
            if (options.service) {
                args.push(options.service);
                console.log(chalk.gray(`Pulling image for: ${options.service}`));
            }
            else {
                console.log(chalk.gray('Pulling all images...'));
            }
            await this.runDockerCompose(args, composePath);
            console.log(chalk.green('✓ Docker images pulled successfully'));
        }
        catch (error) {
            console.error(chalk.red('✗ Docker pull failed:'), error.message);
            process.exit(1);
        }
    }
    async init() {
        try {
            console.log(chalk.blue('🔧 Initializing Docker environment...'));
            await this.checkDockerInstalled();
            const composePath = path.join(process.cwd(), 'docker-compose.yml');
            if (!await fs.pathExists(composePath)) {
                console.log(chalk.yellow('Creating docker-compose.yml...'));
                await this.createDefaultComposeFile();
            }
            const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
            if (!await fs.pathExists(dockerfilePath)) {
                console.log(chalk.yellow('Creating Dockerfile...'));
                await this.createDefaultDockerfile();
            }
            const dockerignorePath = path.join(process.cwd(), '.dockerignore');
            if (!await fs.pathExists(dockerignorePath)) {
                console.log(chalk.yellow('Creating .dockerignore...'));
                await this.createDefaultDockerignore();
            }
            console.log(chalk.green('✓ Docker environment initialized'));
            console.log(chalk.gray('Run "creatoria-saas docker up" to start services'));
        }
        catch (error) {
            console.error(chalk.red('✗ Docker init failed:'), error.message);
            process.exit(1);
        }
    }
    async findComposeFile() {
        const possiblePaths = [
            'docker-compose.yml',
            'docker-compose.yaml',
            'compose.yml',
            'compose.yaml',
        ];
        for (const filename of possiblePaths) {
            const fullPath = path.join(process.cwd(), filename);
            if (await fs.pathExists(fullPath)) {
                return fullPath;
            }
        }
        return null;
    }
    runDockerCompose(args, composePath, inherit = false) {
        return new Promise((resolve, reject) => {
            const composeArgs = ['-f', composePath, ...args];
            const dockerProcess = (0, child_process_1.spawn)('docker-compose', composeArgs, {
                stdio: inherit ? 'inherit' : 'pipe',
                env: process.env,
            });
            if (!inherit) {
                if (dockerProcess.stdout) {
                    dockerProcess.stdout.on('data', (data) => {
                        process.stdout.write(data);
                    });
                }
                if (dockerProcess.stderr) {
                    dockerProcess.stderr.on('data', (data) => {
                        process.stderr.write(data);
                    });
                }
            }
            dockerProcess.on('error', (error) => {
                if (error.message.includes('ENOENT')) {
                    reject(new Error('docker-compose not found. Please install Docker Compose'));
                }
                else {
                    reject(error);
                }
            });
            dockerProcess.on('exit', (code, signal) => {
                if (code === 0) {
                    resolve();
                }
                else if (signal === 'SIGINT') {
                    reject({ signal });
                }
                else {
                    reject(new Error(`Process exited with code ${code}`));
                }
            });
        });
    }
    async checkDockerInstalled() {
        return new Promise((resolve, reject) => {
            const dockerProcess = (0, child_process_1.spawn)('docker', ['--version']);
            dockerProcess.on('error', () => {
                reject(new Error('Docker not found. Please install Docker first'));
            });
            dockerProcess.on('exit', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error('Docker check failed'));
                }
            });
        });
    }
    async createDefaultComposeFile() {
        const content = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "\${PORT:-3000}:3000"
    environment:
      - NODE_ENV=\${NODE_ENV:-development}
      - PORT=\${PORT:-3000}
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    volumes:
      - ./src:/app/src
      - ./modules:/app/modules
    networks:
      - creatoria

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=\${DB_USERNAME:-postgres}
      - POSTGRES_PASSWORD=\${DB_PASSWORD:-password}
      - POSTGRES_DB=\${DB_DATABASE:-creatoria}
    ports:
      - "\${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - creatoria

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass \${REDIS_PASSWORD:-}
    ports:
      - "\${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    networks:
      - creatoria

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      - RABBITMQ_DEFAULT_USER=\${RABBITMQ_USER:-admin}
      - RABBITMQ_DEFAULT_PASS=\${RABBITMQ_PASSWORD:-admin}
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - creatoria

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  creatoria:
    driver: bridge
`;
        await fs.writeFile('docker-compose.yml', content);
    }
    async createDefaultDockerfile() {
        const content = `# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY .env* ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
`;
        await fs.writeFile('Dockerfile', content);
    }
    async createDefaultDockerignore() {
        const content = `node_modules
npm-debug.log
dist
.git
.gitignore
README.md
.env.local
.env.*.local
coverage
.nyc_output
.idea
.vscode
*.swp
*.swo
*~
.DS_Store
`;
        await fs.writeFile('.dockerignore', content);
    }
};
exports.DockerCommand = DockerCommand;
exports.DockerCommand = DockerCommand = DockerCommand_1 = __decorate([
    (0, common_1.Injectable)()
], DockerCommand);
//# sourceMappingURL=docker.command.js.map