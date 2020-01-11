import { Module } from '@nestjs/common';
import { EVENT_BUS } from 'event/event-bus';
import { NaiveEventBus } from 'event/naive-event-bus';
import { SagaManagerService } from 'event/saga-manager.service';
import { LoggerModule } from 'logger';

/**
 * Event Module
 */
@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: EVENT_BUS,
      useClass: NaiveEventBus,
    },
    SagaManagerService,
  ],
  exports: [EVENT_BUS],
})
export class EventModule {}
