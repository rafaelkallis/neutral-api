import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if the amount of roles is insufficient.
 */
export class InsufficientRoleAmountException extends BadRequestException {
  public constructor() {
    super(
      'The number of roles is insufficient, at least 4 are needed',
      'insufficient_role_amount',
    );
  }
}
