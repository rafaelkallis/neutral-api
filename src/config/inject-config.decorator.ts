import { Inject } from '@nestjs/common';
import { CONFIG } from 'config/constants';

export function InjectConfig(): ParameterDecorator {
  return Inject(CONFIG);
}
