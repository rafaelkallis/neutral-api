import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if consensuality is invalid.
 */
export class InvalidConsensualityException extends BadRequestException {
  public constructor() {
    super('Invalid consensuality', 'invalid_consensuality');
  }
}
