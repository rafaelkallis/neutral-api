import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if the user has no avatar.
 */
export class NoAvatarException extends BadRequestException {
  public constructor() {
    super('User has no avatar', 'no_avatar');
  }
}
