import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from 'shared/domain/exceptions/DomainException';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  public catch(domainException: DomainException, ctx: ArgumentsHost): void {
    if (ctx.getType() !== 'http') {
      throw new InternalServerErrorException();
    }
    const httpCtx = ctx.switchToHttp();
    const response = httpCtx.getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: domainException.errorCode,
      message: domainException.message,
    });
  }
}
