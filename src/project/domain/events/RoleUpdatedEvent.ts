import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { Role } from 'project/domain/Role';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 *
 */
@DomainEventKey('project.role_updated')
export class RoleUpdatedEvent extends DomainEvent {
  public readonly role: Role;

  constructor(role: Role) {
    super();
    this.role = role;
  }
}
