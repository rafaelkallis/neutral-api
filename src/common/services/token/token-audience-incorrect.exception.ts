import { UnauthorizedException } from '@nestjs/common';

export class TokenAudienceIncorrectException extends UnauthorizedException {
  constructor() {
    super('Token audience is incorrect', 'token_audience_incorrect');
  }
}
