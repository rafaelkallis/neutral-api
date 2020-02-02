import { AbstractEvent } from 'event';
import { RoleModel } from 'role/domain/RoleModel';

export class RoleDeletedEvent extends AbstractEvent {
  public readonly role: RoleModel;

  constructor(role: RoleModel) {
    super();
    this.role = role;
  }
}
