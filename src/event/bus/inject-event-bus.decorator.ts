import { Inject } from '@nestjs/common';
import { EVENT_BUS } from 'event/constants';

export function InjectEventBus(): ParameterDecorator {
  return Inject(EVENT_BUS);
}
