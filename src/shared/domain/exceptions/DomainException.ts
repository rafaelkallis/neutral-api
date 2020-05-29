import { BadRequestException } from '@nestjs/common';

export class DomainException extends BadRequestException {
  public constructor(errorCode: string, message: string) {
    super(errorCode, message);
  }
}
