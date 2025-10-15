import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import * as redisStore from 'cache-manager-redis-yet';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.redis;
        if (!redisConfig || !redisConfig.host) {
          // Return in-memory cache if Redis is not configured
          return {
            ttl: 60,
          };
        }
        return {
          store: redisStore,
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          ttl: redisConfig.ttl || 60,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}