import { InternalServerErrorException } from '@nestjs/common';

/**
 * Error thrown if an invariant is violated.
 */
export class InvariantViolationException extends InternalServerErrorException {
  public constructor() {
    super('Invariant violation', 'invariant_violation');
  }
}
