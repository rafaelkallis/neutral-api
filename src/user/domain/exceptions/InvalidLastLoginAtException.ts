import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an lastLoginAt is invalid.
 */
export class InvalidLastLoginAtException extends BadRequestException {
  public constructor() {
    super('Invalid lastLoginAt value', 'invalid_last_login_at');
  }
}
