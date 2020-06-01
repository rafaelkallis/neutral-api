import { Exception } from 'shared/domain/exceptions/Exception';

/**
 * Exception thrown if a validation fails.
 */
export class ValidationException extends Exception {
  public constructor(message: string) {
    super('validation', message);
  }
}
