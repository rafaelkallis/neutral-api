import { ReadonlyRole } from 'project/domain/Role';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { ReadonlyProject } from 'project/domain/Project';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.existing_user_assigned')
export class ExistingUserAssignedEvent extends DomainEvent {
  public readonly project: ReadonlyProject;
  public readonly role: ReadonlyRole;

  public constructor(project: ReadonlyProject, role: ReadonlyRole) {
    super();
    this.project = project;
    this.role = role;
  }
}
