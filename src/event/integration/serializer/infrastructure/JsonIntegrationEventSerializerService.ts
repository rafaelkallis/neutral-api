import 'reflect-metadata';
import { Injectable, Type, Logger } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { IntegrationEvent } from 'event/integration/IntegrationEvent';
import { IntegrationEventSerializer } from 'event/integration/serializer/application/IntegrationEventSerializer';
import { getIntegrationEventKey } from 'event/integration/IntegrationEventKey';

@Injectable()
export class JsonIntegrationEventSerializerService extends IntegrationEventSerializer {
  public constructor(modulesContainer: ModulesContainer) {
    const logger = new Logger(JsonIntegrationEventSerializerService.name, true);
    super(logger, modulesContainer);
  }

  public serialize(event: IntegrationEvent): Buffer {
    const eventKey = getIntegrationEventKey(
      event.constructor as Type<IntegrationEvent>,
    );
    const obj: object & {
      [IntegrationEventSerializer.EVENT_KEY_FIELD]?: string;
    } = event;
    obj[IntegrationEventSerializer.EVENT_KEY_FIELD] = eventKey;
    const str = JSON.stringify(obj);
    return Buffer.from(str);
  }

  public deserialize(buf: Buffer): IntegrationEvent {
    const str = buf.toString();
    const {
      [IntegrationEventSerializer.EVENT_KEY_FIELD]: eventKey,
      ...obj
    } = JSON.parse(str);
    const Event = this.getEventType(eventKey);
    return Object.assign(new Event(), obj);
  }
}
