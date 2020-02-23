import { Role } from 'project/domain/Role';
import { Id } from 'common/domain/value-objects/Id';
import { AbstractEvent } from 'event/abstract.event';
import { Project } from 'project/domain/Project';

/**
 *
 */
export class UserUnassignedEvent extends AbstractEvent {
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
