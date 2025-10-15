<div align="center">

# Creatoria CLI

**A powerful CLI for building enterprise-grade SaaS applications**

[![npm version](https://img.shields.io/npm/v/@creatoria/cli.svg?style=flat-square)](https://www.npmjs.com/package/@creatoria/cli)
[![npm downloads](https://img.shields.io/npm/dm/@creatoria/cli.svg?style=flat-square)](https://www.npmjs.com/package/@creatoria/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square)](https://www.typescriptlang.org)

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🚀 What is Creatoria CLI?

Creatoria CLI (`cra`) is a modern command-line interface for scaffolding and managing enterprise-grade SaaS applications. Built with NestJS and TypeScript, it provides everything you need to build scalable, modular, and production-ready applications.

**Perfect for:**
- 🏢 Enterprise SaaS platforms
- 💼 Business management systems (CRM, ERP, etc.)
- 🛒 E-commerce platforms
- 🤖 AI-powered applications
- 📊 Data-driven applications

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Core Features
- **📦 Modular Architecture** - Plugin-based system with dynamic loading
- **🔧 Project Scaffolding** - Create projects in seconds
- **🗄️ Multi-Database Support** - PostgreSQL, MySQL, MongoDB
- **🔐 Security First** - Built-in authentication, authorization, and security best practices
- **🐳 Docker Ready** - Production-ready Docker configurations

</td>
<td width="50%">

### ⚡ Developer Experience
- **📚 Auto-Generated API Docs** - Swagger/OpenAPI integration
- **🧪 Testing Ready** - Unit, integration, and E2E testing setup
- **🎨 TypeScript** - Full type safety and IntelliSense
- **🔥 Hot Reload** - Fast development with instant feedback
- **📈 Performance Optimized** - Lazy loading and smart caching

</td>
</tr>
</table>

## 📦 Quick Start

### Installation

```bash
# Install globally
npm install -g @creatoria/cli

# Verify installation
cra --version
```

### Create Your First Project

```bash
# Create a new project
cra create my-awesome-app

# Navigate to project
cd my-awesome-app

# Start development server
npm run start:dev
```

That's it! Your application is now running at `http://localhost:3000` 🎉

### Access API Documentation

Once your app is running, visit:
- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🎯 Usage

### Creating Projects

```bash
# Create with default features
cra create my-project

# Create with custom configuration
cra create my-project \
  --features=auth,database,swagger,redis \
  --db-type=postgres \
  --db-host=localhost \
  --db-port=5432

# Create without installing dependencies
cra create my-project --skip-install

# Create without Docker setup
cra create my-project --skip-docker
```

### Module Management

```bash
# Install business modules
cra module install

# List available modules
cra module list

# Enable a module
cra module enable crm

# Disable a module
cra module disable erp

# Get module information
cra module info mall
```

### Database Operations

```bash
# Run migrations
cra db migrate

# Seed database
cra db seed

# Reset database
cra db reset
```

### Configuration

```bash
# Show current configuration
cra config show

# Set configuration value
cra config set KEY VALUE
```

### Development Server

```bash
# Start in development mode
cra dev

# Start production server
cra start
```

## 📚 Available Modules

Creatoria comes with pre-built enterprise modules:

| Module | Description | Status |
|--------|-------------|--------|
| **System** | User, Role, Permission management | ✅ Stable |
| **CRM** | Customer Relationship Management | ✅ Stable |
| **ERP** | Enterprise Resource Planning | ✅ Stable |
| **Mall** | E-commerce platform | ✅ Stable |
| **BPM** | Business Process Management | ✅ Stable |
| **AI** | AI-powered features | 🚧 Beta |

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project root:

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
DB_PASSWORD=your_password
DB_DATABASE=creatoria

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=api-docs
```

### Project Features

When creating a project, you can enable/disable features:

```bash
cra create my-project --features=auth,database,swagger,redis,cors,websocket
```

**Available Features:**
- `auth` - Authentication & Authorization
- `database` - Database integration
- `swagger` - API documentation
- `redis` - Redis caching
- `cors` - CORS support
- `websocket` - WebSocket support
- `graphql` - GraphQL API
- `microservice` - Microservice architecture
- `schedule` - Task scheduling
- `queue` - Message queue
- `email` - Email service
- `sms` - SMS service

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Building Docker Image

```bash
# Build
docker build -t my-app .

# Run
docker run -p 3000:3000 --env-file .env my-app
```

## 🏗️ Project Structure

```
my-project/
├── src/
│   ├── auth/              # Authentication module
│   ├── system/            # System management
│   ├── common/            # Shared utilities
│   ├── database/          # Database configuration
│   ├── app.module.ts      # Root module
│   └── main.ts           # Application entry
├── test/                  # Test files
├── docker-compose.yml     # Docker Compose config
├── Dockerfile            # Docker image
├── .env                  # Environment variables
└── package.json          # Dependencies
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📖 Documentation

- **[Architecture Guide](./docs/architecture.md)** - System architecture overview
- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Module Development](./docs/module-development.md)** - Create custom modules
- **[Deployment Guide](./docs/deployment.md)** - Production deployment
- **[FAQ](./docs/FAQ.md)** - Frequently asked questions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/rn1024/creatoria-saas-cli.git
cd creatoria-saas-cli

# Install dependencies
npm install

# Build
npm run build

# Link for local testing
npm link

# Test CLI
cra create test-project
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🗺️ Roadmap

- [ ] Plugin marketplace
- [ ] Visual project builder
- [ ] Cloud deployment integration
- [ ] AI-powered code generation
- [ ] Mobile app support (React Native/Flutter)
- [ ] Multi-language i18n support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with amazing open-source projects:

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Docker](https://www.docker.com/) - Containerization
- [PostgreSQL](https://www.postgresql.org/) - Advanced open source database

## 💬 Support

- 📧 Email: support@creatoria.com
- 💬 Discord: [Join our community](https://discord.gg/creatoria)
- 🐛 Issues: [GitHub Issues](https://github.com/rn1024/creatoria-saas-cli/issues)
- 📖 Docs: [Documentation](https://docs.creatoria.com)

## ⭐ Show Your Support

If you find this project helpful, please give it a ⭐️ on [GitHub](https://github.com/rn1024/creatoria-saas-cli)!

---

<div align="center">

**Made with ❤️ by the Creatoria Team**

[Website](https://creatoria.com) • [GitHub](https://github.com/rn1024/creatoria-saas-cli) • [Twitter](https://twitter.com/creatoria)

</div>
