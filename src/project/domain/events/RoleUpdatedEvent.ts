import { DomainEvent } from 'event/domain/DomainEvent';
import { Role } from 'project/domain/Role';

/**
 *
 */
export class RoleUpdatedEvent extends DomainEvent {
  public readonly role: Role;

  constructor(role: Role) {
    super();
    this.role = role;
  }
}
