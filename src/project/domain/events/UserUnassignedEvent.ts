import { RoleModel } from 'role/domain/RoleModel';
import { Id } from 'common/domain/value-objects/Id';
import { AbstractEvent } from 'event/abstract.event';
import { ProjectModel } from 'project/domain/ProjectModel';

/**
 *
 */
export class UserUnassignedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly role: RoleModel;
  public readonly unassignedUserId: Id;

  public constructor(
    project: ProjectModel,
    role: RoleModel,
    unassignedUserId: Id,
  ) {
    super();
    this.project = project;
    this.role = role;
    this.unassignedUserId = unassignedUserId;
  }
}
