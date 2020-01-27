import { Inject } from '@nestjs/common';
import { DatabaseService } from 'database/database.service';

export function InjectDatabase(): ParameterDecorator {
  return Inject(DatabaseService);
}
