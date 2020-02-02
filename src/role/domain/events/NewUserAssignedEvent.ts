import { AbstractEvent } from 'event';
import { ProjectModel } from 'project';
import { RoleModel } from 'role/domain/RoleModel';

export class NewUserAssignedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly role: RoleModel;
  public readonly assigneeEmail: string;

  public constructor(
    project: ProjectModel,
    role: RoleModel,
    assigneeEmail: string,
  ) {
    super();
    this.project = project;
    this.role = role;
    this.assigneeEmail = assigneeEmail;
  }
}
