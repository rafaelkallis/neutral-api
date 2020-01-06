import { Module } from '@nestjs/common';
import { EVENT_BUS } from 'event/event-bus';
import { NaiveEventBus } from 'event/naive-event-bus';

/**
 * Event Module
 */
@Module({
  providers: [
    {
      provide: EVENT_BUS,
      useClass: NaiveEventBus,
    },
  ],
  exports: [EVENT_BUS],
})
export class EventModule {}
