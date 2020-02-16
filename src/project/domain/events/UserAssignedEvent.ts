import { AbstractEvent } from 'event';
import { RoleModel } from 'role/domain/RoleModel';
import { ProjectModel } from 'project/domain/ProjectModel';
import { UserModel } from 'user/domain/UserModel';

/**
 *
 */
export class UserAssignedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly role: RoleModel;
  public readonly user: UserModel;

  public constructor(project: ProjectModel, role: RoleModel, user: UserModel) {
    super();
    this.project = project;
    this.role = role;
    this.user = user;
  }
}
