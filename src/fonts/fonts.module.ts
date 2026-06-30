import { Module } from '@nestjs/common';
import { FontsService } from './fonts.service';
import { FontsController } from './fonts.controller';

@Module({
  imports: [],
  controllers: [FontsController],
  providers: [FontsService],
  exports: [FontsService],
})
export class FontsModule {}
