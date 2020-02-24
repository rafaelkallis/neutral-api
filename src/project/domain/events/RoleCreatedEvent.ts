import { Role } from 'project/domain/Role';
import { DomainEvent } from 'event/domain/DomainEvent';
import { Project } from 'project/domain/Project';

export class RoleCreatedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly role: Role;

  public constructor(project: Project, role: Role) {
    super();
    this.project = project;
    this.role = role;
  }
}
