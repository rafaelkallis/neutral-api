import { Inject } from '@nestjs/common';
import { DATABASE } from 'database/constants';

export function InjectDatabase(): ParameterDecorator {
  return Inject(DATABASE);
}
