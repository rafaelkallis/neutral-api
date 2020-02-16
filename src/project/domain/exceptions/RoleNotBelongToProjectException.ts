import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown if a role does not belong to a project.
 */
export class RoleNotBelongToProjectException extends BadRequestException {
  public constructor() {
    super('Role does not belong to project', 'role_not_belong_to_project');
  }
}
