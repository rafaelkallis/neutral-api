import { Inject } from '@nestjs/common';
import { LOGGER } from 'logger/constants';

export function InjectLogger(): ParameterDecorator {
  return Inject(LOGGER);
}
