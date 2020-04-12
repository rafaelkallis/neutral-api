import { Role } from 'project/domain/Role';
import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { Project } from 'project/domain/Project';

// TODO add user
export class ExistingUserAssignedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly role: Role;

  public constructor(project: Project, role: Role) {
    super();
    this.project = project;
    this.role = role;
  }
}
