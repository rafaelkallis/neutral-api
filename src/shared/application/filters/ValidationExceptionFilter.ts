import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from 'shared/application/exceptions/ValidationException';

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  public catch(
    validationException: ValidationException,
    ctx: ArgumentsHost,
  ): void {
    if (ctx.getType() !== 'http') {
      throw new InternalServerErrorException();
    }
    const httpCtx = ctx.switchToHttp();
    const response = httpCtx.getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: validationException.errorCode,
      message: validationException.message,
    });
  }
}
