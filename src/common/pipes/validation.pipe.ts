import {
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { ValidationException } from '../exceptions/validation.exception';

/**
 * Validation Pipe with sane defaults.
 */
@Injectable()
export class ValidationPipe extends NestValidationPipe {
  public constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]): ValidationException =>
        new ValidationException(errors[0].value),
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  }
}
