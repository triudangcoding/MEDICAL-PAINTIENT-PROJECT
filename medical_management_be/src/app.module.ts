import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { FeatureModuleModule } from '@/modules/feature-module.module';

@Module({
  imports: [CoreModule, FeatureModuleModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
