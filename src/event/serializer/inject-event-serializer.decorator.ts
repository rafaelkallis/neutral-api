import { Inject } from '@nestjs/common';
import { EVENT_SERIALIZER } from 'event/constants';

export function InjectEventSerializer(): ParameterDecorator {
  return Inject(EVENT_SERIALIZER);
}
