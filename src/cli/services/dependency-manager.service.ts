import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface PackageDependencies {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

@Injectable()
export class DependencyManagerService {
  private readonly featureDependencies: Record<string, PackageDependencies> = {
    auth: {
      dependencies: {
        '@nestjs/jwt': '^11.0.0',
        '@nestjs/passport': '^11.0.0',
        'passport': '^0.7.0',
        'passport-jwt': '^4.0.1',
        'passport-local': '^1.0.0',
        'bcryptjs': '^2.4.3',
      },
      devDependencies: {
        '@types/passport-jwt': '^4.0.0',
        '@types/passport-local': '^1.0.38',
        '@types/bcryptjs': '^2.4.6',
      },
    },
    redis: {
      dependencies: {
        '@nestjs/cache-manager': '^2.0.0',
        'cache-manager': '^5.0.0',
        'cache-manager-redis-store': '^3.0.0',
        'redis': '^4.0.0',
      },
    },
    swagger: {
      dependencies: {
        '@nestjs/swagger': '^11.0.0',
        'swagger-ui-express': '^5.0.0',
      },
    },
    cors: {
      // CORS is included in @nestjs/platform-express
      dependencies: {},
    },
    throttle: {
      dependencies: {
        '@nestjs/throttler': '^7.0.0',
      },
    },
    email: {
      dependencies: {
        '@nestjs-modules/mailer': '^2.0.0',
        'nodemailer': '^6.9.0',
      },
    },
    sms: {
      dependencies: {
        '@alicloud/sms-sdk': '^1.1.6',
      },
    },
    oss: {
      dependencies: {
        'ali-oss': '^6.17.0',
        'aws-sdk': '^2.1400.0',
      },
    },
    elasticsearch: {
      dependencies: {
        '@elastic/elasticsearch': '^8.0.0',
        '@nestjs/elasticsearch': '^10.0.0',
      },
    },
    rabbitmq: {
      dependencies: {
        '@nestjs/microservices': '^11.0.0',
        'amqplib': '^0.10.0',
        'amqp-connection-manager': '^4.1.0',
      },
    },
    minio: {
      dependencies: {
        'minio': '^8.0.0',
      },
    },
    social: {
      dependencies: {
        'passport-github2': '^0.1.12',
        'passport-google-oauth20': '^2.0.0',
        'passport-wechat': '^2.0.0',
      },
    },
    payment: {
      dependencies: {
        'alipay-sdk': '^3.4.0',
        'wechatpay-axios-plugin': '^0.9.0',
      },
    },
  };

  mergeDependencies(features: string[]): PackageDependencies {
    const result: PackageDependencies = {
      dependencies: {},
      devDependencies: {},
    };

    for (const feature of features) {
      const deps = this.featureDependencies[feature];
      if (deps) {
        if (deps.dependencies) {
          Object.assign(result.dependencies!, deps.dependencies);
        }
        if (deps.devDependencies) {
          Object.assign(result.devDependencies!, deps.devDependencies);
        }
      }
    }

    return result;
  }

  async updatePackageJson(
    projectPath: string,
    features: string[],
  ): Promise<void> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const featureDeps = this.mergeDependencies(features);

    if (featureDeps.dependencies) {
      packageJson.dependencies = {
        ...packageJson.dependencies,
        ...featureDeps.dependencies,
      };
    }

    if (featureDeps.devDependencies) {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        ...featureDeps.devDependencies,
      };
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  getRequiredDependencies(features: string[]): string[] {
    const deps = this.mergeDependencies(features);
    return [
      ...Object.keys(deps.dependencies || {}),
      ...Object.keys(deps.devDependencies || {}),
    ];
  }
}