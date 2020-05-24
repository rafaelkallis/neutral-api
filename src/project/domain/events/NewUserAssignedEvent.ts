import { ReadonlyRole } from 'project/domain/role/Role';
import { Email } from 'user/domain/value-objects/Email';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { ReadonlyProject } from 'project/domain/project/Project';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.invited_user_assigned')
export class NewUserAssignedEvent extends DomainEvent {
  public readonly project: ReadonlyProject;
  public readonly role: ReadonlyRole;
  public readonly assigneeEmail: Email;
  public readonly signupLink: string;

  public constructor(
    project: ReadonlyProject,
    role: ReadonlyRole,
    assigneeEmail: Email,
    signupLink: string,
  ) {
    super();
    this.project = project;
    this.role = role;
    this.assigneeEmail = assigneeEmail;
    this.signupLink = signupLink;
  }
}
