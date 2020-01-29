import { Module } from '@nestjs/common';
import { LoggerModule } from 'logger';
import {
  EVENT_PUBLISHER,
  EVENT_SUBSCRIBER,
  EVENT_BUS,
  // EVENT_SERIALIZER,
} from 'event/constants';
import { NaiveEventBusService } from 'event/bus/naive-event-bus.service';
import { SagaManagerService } from 'event/services/saga-manager.service';
// import { JsonEventSerializerService } from 'event/serializer/json-event-serializer.service';

/**
 * Event Module
 */
@Module({
  imports: [LoggerModule],
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
    SagaManagerService,
  ],
  exports: [EVENT_BUS, EVENT_PUBLISHER, EVENT_SUBSCRIBER],
})
export class EventModule {}
