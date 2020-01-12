import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER } from 'event/constants';

export function InjectEventPublisher(): ParameterDecorator {
  return Inject(EVENT_PUBLISHER);
}
