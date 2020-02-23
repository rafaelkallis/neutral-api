import { AbstractEvent } from 'event';
import { Role } from 'project/domain/Role';

/**
 *
 */
export class RoleDeletedEvent extends AbstractEvent {
  public readonly role: Role;

  constructor(role: Role) {
    super();
    this.role = role;
  }
}
