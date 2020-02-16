import { RoleModel } from 'role/domain/RoleModel';
import { Email } from 'user/domain/value-objects/Email';
import { AbstractEvent } from 'event/abstract.event';
import { ProjectModel } from 'project/domain/ProjectModel';

export class NewUserAssignedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly role: RoleModel;
  public readonly assigneeEmail: Email;

  public constructor(
    project: ProjectModel,
    role: RoleModel,
    assigneeEmail: Email,
  ) {
    super();
    this.project = project;
    this.role = role;
    this.assigneeEmail = assigneeEmail;
  }
}
