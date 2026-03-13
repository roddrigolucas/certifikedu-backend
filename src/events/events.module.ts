import { Module } from '@nestjs/common';
import { AuxModule } from 'src/_aux/_aux.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [AuxModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule { }
