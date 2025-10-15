# Creatoria SaaS CLI

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/creatoria/cli)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/creatoria/cli)

A powerful command-line interface and runtime for the Creatoria SaaS platform, built with NestJS and TypeScript.

## ✨ Features

- 🚀 **Modular Architecture** - Dynamic module loading from remote repositories
- 🔧 **CLI Commands** - Comprehensive CLI for module and database management
- 🗄️ **Multi-Database Support** - PostgreSQL with TypeORM
- 🔐 **Security First** - Input validation, path traversal protection, command injection prevention
- 📦 **Smart Caching** - Multi-layer caching with Redis support
- 📨 **Message Queue** - RabbitMQ for async processing
- 📚 **Auto Documentation** - Swagger/OpenAPI with multiple export formats
- 🧪 **Complete Testing** - Unit, Integration, E2E tests with coverage reports
- 🐳 **Docker Support** - Production-ready Docker configuration
- ⚡ **Performance Optimized** - Lazy loading, startup optimization
- 🏢 **Multi-Tenant** - Built-in multi-tenant support

## Installation

```bash
# Clone the repository
git clone https://github.com/creatoria/creatoria-saas-cli.git
cd creatoria-saas-cli

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your environment variables
nano .env
```

## Usage

### CLI Commands

```bash
# Project scaffolding
creatoria-saas create <name>              # Create a new project from template

# Module management
creatoria-saas module install              # Install modules from remote repository
creatoria-saas module list                 # List all installed modules
creatoria-saas module enable <name>        # Enable a module
creatoria-saas module disable <name>       # Disable a module
creatoria-saas module info <name>          # Show module information

# Database management
creatoria-saas db migrate                  # Run database migrations
creatoria-saas db seed                     # Run database seeds
creatoria-saas db reset                    # Reset database

# Configuration
creatoria-saas config show                 # Show current configuration
creatoria-saas config set <key> <value>    # Set configuration value

# Server
creatoria-saas start                       # Start the application
creatoria-saas dev                         # Start in development mode
```

### NPM Scripts

```bash
# Development
npm run start:dev        # Start with hot-reload
npm run start:debug      # Start with debugger
npm run start:prod       # Start production server

# Build
npm run build           # Build the application

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage
npm run test:e2e        # Run e2e tests

# Docker
npm run docker:build    # Build Docker image
npm run docker:up       # Start with Docker Compose
npm run docker:down     # Stop Docker containers
npm run docker:logs     # View Docker logs

# Module operations
npm run module:install  # Install modules
npm run module:list     # List modules
npm run db:migrate      # Run migrations
npm run db:seed         # Run seeds
```

## Project Structure

```
creatoria-saas-cli/
├── src/
│   ├── cli/              # CLI commands
│   ├── config/           # Configuration module
│   ├── core/             # Core modules
│   │   ├── cache/        # Cache module
│   │   ├── database/     # Database module
│   │   └── module-loader/ # Module loader
│   ├── interfaces/       # TypeScript interfaces
│   ├── app.module.ts     # Root module
│   └── main.ts          # Application entry point
├── bin/
│   └── creatoria-saas   # CLI executable
├── modules/             # Installed modules directory
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile          # Docker image definition
├── creatoria.config.ts # Application configuration
└── package.json        # Project dependencies
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=creatoria

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Modules
MODULES_SOURCE=github:creatoria/creatoria-saas-modules
ENABLED_MODULES=system,crm,erp,mall,bpm,ai

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=api-docs
```

## Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### Building Docker Image

```bash
# Build image
docker build -t creatoria-saas-cli .

# Run container
docker run -p 3000:3000 --env-file .env creatoria-saas-cli
```

## Module Development

Modules are loaded from the `creatoria-saas-modules` repository. Each module should follow this structure:

```
module-name/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── entities/
│   ├── dto/
│   └── module-name.module.ts
├── migrations/
├── seeds/
├── module.json         # Module metadata
└── package.json
```

### Module Metadata (module.json)

```json
{
  "name": "module-name",
  "displayName": "Module Display Name",
  "version": "1.0.0",
  "description": "Module description",
  "author": "Author name",
  "dependencies": ["system"],
  "permissions": [
    "module:action:view",
    "module:action:create"
  ],
  "menus": [
    {
      "name": "Menu Item",
      "path": "/module/path",
      "icon": "icon-name",
      "permission": "module:action:view"
    }
  ]
}
```

## API Documentation

When Swagger is enabled, API documentation is available at:

```
http://localhost:3000/api-docs
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@creatoria.com or join our Discord channel.

## Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript
- [Commander.js](https://github.com/tj/commander.js/) - Node.js command-line interfaces
- [Docker](https://www.docker.com/) - Containerization platform
