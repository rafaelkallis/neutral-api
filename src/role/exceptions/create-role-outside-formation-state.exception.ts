import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a role is attemted to be created outside the formation state.
 */
export class CreateRoleOutsideFormationStateException extends BadRequestException {
  public constructor() {
    super(
      'Roles can only be created during formation state',
      'create_role_outside_formation_state',
    );
  }
}
