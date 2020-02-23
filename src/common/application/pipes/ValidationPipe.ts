import {
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ValidationException } from 'common/exceptions/validation.exception';

/**
 * Validation Pipe with sane defaults.
 */
@Injectable()
export class ValidationPipe extends NestValidationPipe {
  public constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]): ValidationException => {
        const [error] = errors;
        const [message] = Object.values(error.constraints);
        return new ValidationException(message);
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  }
}
