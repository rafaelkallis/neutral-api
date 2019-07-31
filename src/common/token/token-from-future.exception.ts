import { BadRequestException } from '@nestjs/common';

export class TokenFromFutureException extends BadRequestException {
  constructor() {
    super('Token is from the future', 'token_from_future');
  }
}
