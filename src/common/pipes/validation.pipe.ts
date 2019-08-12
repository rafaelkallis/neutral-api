import {
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { ValidationException } from '../exceptions/validation.exception';

/**
 * Validation Pipe
 *
 * Use instead of nestjs's ValidationPipe to get a better error.
 */
@Injectable()
export class ValidationPipe extends NestValidationPipe {
  public constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]): ValidationException =>
        new ValidationException(errors[0].value),
    });
  }
}
