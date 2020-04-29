import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { Role } from 'project/domain/role/Role';
import { Project } from 'project/domain/project/Project';
import { ReadonlyUser } from 'user/domain/User';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 *
 */
@DomainEventKey('project.user_assigned')
export class UserAssignedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly role: Role;
  public readonly user: ReadonlyUser;

  public constructor(project: Project, role: Role, user: ReadonlyUser) {
    super();
    this.project = project;
    this.role = role;
    this.user = user;
  }
}
