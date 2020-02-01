import { AbstractEvent } from 'event';
import { RoleModel } from 'role/role.model';

export class RoleUpdatedEvent extends AbstractEvent {
  public readonly role: RoleModel;

  constructor(role: RoleModel) {
    super();
    this.role = role;
  }
}
