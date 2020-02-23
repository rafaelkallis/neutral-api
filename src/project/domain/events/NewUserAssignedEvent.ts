import { Role } from 'project/domain/Role';
import { Email } from 'user/domain/value-objects/Email';
import { AbstractEvent } from 'event/abstract.event';
import { Project } from 'project/domain/Project';

export class NewUserAssignedEvent extends AbstractEvent {
  public readonly project: Project;
  public readonly role: Role;
  public readonly assigneeEmail: Email;

  public constructor(project: Project, role: Role, assigneeEmail: Email) {
    super();
    this.project = project;
    this.role = role;
    this.assigneeEmail = assigneeEmail;
  }
}
