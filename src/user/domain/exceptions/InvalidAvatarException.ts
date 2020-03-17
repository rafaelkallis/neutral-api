import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an avatar is invalid.
 */
export class InvalidAvatarException extends BadRequestException {
  public constructor() {
    super('Invalid avatar', 'invalid_avatar');
  }
}
