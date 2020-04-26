import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if an operation is not supported for the current project's state.
 */
export class OperationNotSupportedByCurrentProjectStateException extends BadRequestException {
  public constructor() {
    super(
      `Requested operation not supported by the current project state.`,
      'operation_unsupported_by_current_project_state',
    );
  }
}
