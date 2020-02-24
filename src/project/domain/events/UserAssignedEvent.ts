import { DomainEvent } from 'event/domain/DomainEvent';
import { Role } from 'project/domain/Role';
import { Project } from 'project/domain/Project';
import { User } from 'user/domain/User';

/**
 *
 */
export class UserAssignedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly role: Role;
  public readonly user: User;

  public constructor(project: Project, role: Role, user: User) {
    super();
    this.project = project;
    this.role = role;
    this.user = user;
  }
}
