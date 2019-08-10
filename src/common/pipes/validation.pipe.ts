import {
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationException(errors[0].value),
    });
  }
}
