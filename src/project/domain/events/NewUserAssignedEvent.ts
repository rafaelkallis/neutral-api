import { Role } from 'project/domain/Role';
import { Email } from 'user/domain/value-objects/Email';
import { DomainEvent } from 'event/domain/DomainEvent';
import { Project } from 'project/domain/Project';

export class NewUserAssignedEvent extends DomainEvent {
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