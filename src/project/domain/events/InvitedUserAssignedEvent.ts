import { ReadonlyRole } from 'project/domain/role/Role';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { ReadonlyProject } from 'project/domain/project/Project';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyUser } from 'user/domain/User';

@DomainEventKey('project.invited_user_assigned')
export class InvitedUserAssignedEvent extends DomainEvent {
  public readonly project: ReadonlyProject;
  public readonly role: ReadonlyRole;
  public readonly assignee: ReadonlyUser;
  public readonly signupLink: string;

  public constructor(
    project: ReadonlyProject,
    role: ReadonlyRole,
    assignee: ReadonlyUser,
    signupLink: string,
  ) {
    super();
    this.project = project;
    this.role = role;
    this.assignee = assignee;
    this.signupLink = signupLink;
  }
}
