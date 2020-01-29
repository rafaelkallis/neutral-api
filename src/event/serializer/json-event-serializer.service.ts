import 'reflect-metadata';
import { Injectable, Type, Logger } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { AbstractEvent } from 'event/abstract.event';
import { EventSerializerService } from 'event/serializer/event-serializer.service';

@Injectable()
export class JsonEventSerializerService extends EventSerializerService {
  public constructor(modulesContainer: ModulesContainer) {
    const logger = new Logger(JsonEventSerializerService.name, true);
    super(logger, modulesContainer);
  }

  /**
   *
   */
  public serialize(event: AbstractEvent): Buffer {
    const eventKey = this.getEventKey(event.constructor as Type<AbstractEvent>);
    const obj: object & {
      [EventSerializerService.EVENT_KEY_FIELD]?: string;
    } = event;
    obj[EventSerializerService.EVENT_KEY_FIELD] = eventKey;
    const str = JSON.stringify(obj);
    return Buffer.from(str);
  }

  /**
   *
   */
  public deserialize(buf: Buffer): AbstractEvent {
    const str = buf.toString();
    const {
      [EventSerializerService.EVENT_KEY_FIELD]: eventKey,
      ...obj
    } = JSON.parse(str);
    const Event = this.getEventType(eventKey);
    return Object.assign(new Event(), obj);
  }
}
