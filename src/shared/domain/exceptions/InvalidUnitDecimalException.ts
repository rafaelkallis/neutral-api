import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a unit decimal is invalid.
 */
export class InvalidUnitDecimalException extends BadRequestException {
  public constructor() {
    super('Invalid unit decimal', 'invalid_unit_decimal');
  }
}
