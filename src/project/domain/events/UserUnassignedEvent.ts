import { Role } from 'project/domain/Role';
import { Id } from 'shared/domain/value-objects/Id';
import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { Project } from 'project/domain/Project';

/**
 *
 */
export class UserUnassignedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly role: Role;
  public readonly unassignedUserId: Id;

  public constructor(project: Project, role: Role, unassignedUserId: Id) {
    super();
    this.project = project;
    this.role = role;
    this.unassignedUserId = unassignedUserId;
  }
}
