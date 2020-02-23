import { Role } from 'project/domain/Role';
import { AbstractEvent } from 'event/abstract.event';
import { Project } from 'project/domain/Project';

export class ExistingUserAssignedEvent extends AbstractEvent {
  public readonly project: Project;
  public readonly role: Role;

  public constructor(project: Project, role: Role) {
    super();
    this.project = project;
    this.role = role;
  }
}
