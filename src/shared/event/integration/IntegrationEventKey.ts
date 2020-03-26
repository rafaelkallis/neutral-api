import 'reflect-metadata';
import { Type } from '@nestjs/common';
import { IntegrationEvent } from 'shared/event/integration/IntegrationEvent';

export const INTEGRATION_EVENT_KEY_METADATA = Symbol(
  'INTEGRATION_EVENT_KEY_METADATA',
);

/**
 *
 */
export function IntegrationEventKey(
  integrationEventKey: string,
): ClassDecorator {
  return (target: object): void => {
    Reflect.defineMetadata(
      INTEGRATION_EVENT_KEY_METADATA,
      integrationEventKey,
      target.constructor,
    );
  };
}

/**
 *
 */
export function getIntegrationEventKey(
  IntegrationEvent: Type<IntegrationEvent>,
): string {
  const integrationEventKey: string | undefined = Reflect.getMetadata(
    INTEGRATION_EVENT_KEY_METADATA,
    IntegrationEvent,
  );
  if (!integrationEventKey) {
    throw new Error(
      `no integration event key found, forgot @${IntegrationEvent.constructor.name}("my_key")?`,
    );
  }
  return integrationEventKey;
}
