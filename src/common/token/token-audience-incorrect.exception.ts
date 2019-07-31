import { BadRequestException } from '@nestjs/common';

export class TokenAudienceIncorrectException extends BadRequestException {
  constructor() {
    super('Token audience is incorrect', 'token_audience_incorrect');
  }
}
