import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from 'shared/domain/DomainError';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  public catch(domainError: DomainError, ctx: ArgumentsHost): void {
    if (ctx.getType() !== 'http') {
      throw new InternalServerErrorException();
    }
    const httpCtx = ctx.switchToHttp();
    const response = httpCtx.getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: domainError.code,
      message: domainError.message,
    });
  }
}
