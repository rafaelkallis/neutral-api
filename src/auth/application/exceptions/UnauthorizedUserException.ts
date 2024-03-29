import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown if the user is not authorized.
 */
export class UnauthorizedUserException extends UnauthorizedException {
  public constructor() {
    super('User is not authorized', 'unauthorized_user');
  }
}
