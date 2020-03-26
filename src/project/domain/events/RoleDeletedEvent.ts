import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { Role } from 'project/domain/Role';

/**
 *
 */
export class RoleDeletedEvent extends DomainEvent {
  public readonly role: Role;

  constructor(role: Role) {
    super();
    this.role = role;
  }
}
