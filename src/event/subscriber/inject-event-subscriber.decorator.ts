import { Inject } from '@nestjs/common';
import { EVENT_SUBSCRIBER } from 'event/constants';

export function InjectEventSubscriber(): ParameterDecorator {
  return Inject(EVENT_SUBSCRIBER);
}
