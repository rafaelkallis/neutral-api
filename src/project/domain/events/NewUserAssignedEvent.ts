import { Role } from 'project/domain/Role';
import { Email } from 'user/domain/value-objects/Email';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { Project } from 'project/domain/Project';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.new_user_assigned')
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
