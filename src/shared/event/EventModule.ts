import { Module } from '@nestjs/common';
import { NaiveEventBusService } from 'shared/event/bus/infrastructure/NaiveEventBusService';
import { DomainEventHandlerManagerService } from 'shared/event/domain/DomainEventHandlerManagerService';
import { EVENT_BUS } from 'shared/event/bus/application/EventBus';
import { EVENT_PUBLISHER } from 'shared/event/publisher/EventPublisher';
import { EVENT_SUBSCRIBER } from 'shared/event/subscriber/event-subscriber.service';
import { UtilityModule } from 'shared/utility/UtilityModule';
// import { JsonEventSerializerService } from 'event/serializer/json-event-serializer.service';

/**
 * Event Module
 */
@Module({
  imports: [UtilityModule],
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
