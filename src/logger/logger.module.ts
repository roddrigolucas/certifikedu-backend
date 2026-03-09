import { Global, Module } from '@nestjs/common';
import { CustomLogger } from './custom-logger.service';
import { AlsModule } from '../als/als.module';

@Global()
@Module({
  imports: [AlsModule],
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule {}
