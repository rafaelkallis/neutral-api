import { BadRequestException } from '@nestjs/common';
import { ProjectState } from 'project/domain/value-objects/ProjectState';

/**
 * Exception thrown if an action cannot be performed on the project's current state.
 */
export class ProjectStateAssertionFailureException extends BadRequestException {
  public static from(
    currentState: ProjectState,
    expectedState: ProjectState,
  ): ProjectStateAssertionFailureException {
    return new ProjectStateAssertionFailureException(
      currentState.toString(),
      expectedState.toString(),
    );
  }

  private constructor(current: string, expected: string) {
    super(
      `Project is in "${current}" state but "${expected}" state is required to perform the requested action.`,
      'project_state_assertion_failure',
    );
  }
}
