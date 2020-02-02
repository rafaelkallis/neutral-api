import { AbstractEvent } from 'event';
import { RoleModel } from 'role/domain/RoleModel';
import { ProjectModel } from 'project';

/**
 *
 */
export class UserUnassignedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly role: RoleModel;

  public constructor(project: ProjectModel, role: RoleModel) {
    super();
    this.project = project;
    this.role = role;
  }
}
