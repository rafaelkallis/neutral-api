import { BadRequestException } from '@nestjs/common';
import { UserState } from 'user/domain/value-objects/UserState';

/**
 * Exception thrown if a different user state was expected.
 */
export class UserStateAssertionFailureException extends BadRequestException {
  public static from(
    currentState: UserState,
    expectedState: UserState,
  ): UserStateAssertionFailureException {
    return new UserStateAssertionFailureException(
      currentState.toString(),
      expectedState.toString(),
    );
  }

  private constructor(current: string, expected: string) {
    super(
      `User is in "${current}" state but "${expected}" state was expected.`,
      'user_state_assertion_failure',
    );
  }
}
