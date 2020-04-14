import { Role } from 'project/domain/Role';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { Project } from 'project/domain/Project';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.existing_user_assigned')
export class ExistingUserAssignedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly role: Role;

  public constructor(project: Project, role: Role) {
    super();
    this.project = project;
    this.role = role;
  }
}
