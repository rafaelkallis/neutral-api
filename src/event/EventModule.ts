import { Module } from '@nestjs/common';
import { NaiveEventBusService } from 'event/bus/infrastructure/NaiveEventBusService';
import { DomainEventHandlerManagerService } from 'event/domain/DomainEventHandlerManagerService';
import { EVENT_BUS } from 'event/bus/application/EventBus';
import { EVENT_PUBLISHER } from 'event/publisher/event-publisher.service';
import { EVENT_SUBSCRIBER } from 'event/subscriber/event-subscriber.service';
// import { JsonEventSerializerService } from 'event/serializer/json-event-serializer.service';

/**
 * Event Module
 */
@Module({
  providers: [
    {
      provide: EVENT_BUS,
      useClass: NaiveEventBusService,
    },
    {
      provide: EVENT_PUBLISHER,
      useExisting: EVENT_BUS,
    },
    {
      provide: EVENT_SUBSCRIBER,
      useExisting: EVENT_BUS,
    },
    // {
    //   provide: EVENT_SERIALIZER,
    //   useClass: JsonEventSerializerService,
    // },
    DomainEventHandlerManagerService,
  ],
  exports: [EVENT_BUS, EVENT_PUBLISHER, EVENT_SUBSCRIBER],
})
export class EventModule {}
