import { Module } from '@nestjs/common';
import { LoggerModule } from 'logger';
import { EVENT_PUBLISHER, EVENT_SUBSCRIBER, EVENT_BUS } from 'event/constants';
import { NaiveEventBus } from 'event/services/naive-event-bus';
import { SagaManagerService } from 'event/services/saga-manager.service';

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
    {
      provide: EVENT_PUBLISHER,
      useExisting: EVENT_BUS,
    },
    {
      provide: EVENT_SUBSCRIBER,
      useExisting: EVENT_BUS,
    },
    SagaManagerService,
  ],
  exports: [EVENT_BUS, EVENT_PUBLISHER, EVENT_SUBSCRIBER],
})
export class EventModule {}
