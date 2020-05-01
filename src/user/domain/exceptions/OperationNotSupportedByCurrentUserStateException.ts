import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an operation is not supported for the current user's state.
 */
export class OperationNotSupportedByCurrentUserStateException extends BadRequestException {
  public constructor() {
    super(
      `Requested operation not supported by the current user state.`,
      'operation_unsupported_by_current_user_state',
    );
  }
}
