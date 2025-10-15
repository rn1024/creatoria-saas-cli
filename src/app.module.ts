import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { CacheModule } from './core/cache/cache.module';
import { CliModule } from './cli/cli.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CacheModule,
    CliModule,
  ],
})
export class AppModule {}
