import { Module, Global } from '@nestjs/common';
import { ModuleLoaderService } from './module-loader.service';
import { ConfigModule } from '../../config/config.module';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ModuleLoaderService],
  exports: [ModuleLoaderService],
})
export class ModuleLoaderModule {}