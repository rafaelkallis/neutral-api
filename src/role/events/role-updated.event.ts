import { Event } from 'event';
import { RoleEntity } from 'role/entities/role.entity';

export class RoleUpdatedEvent extends Event {
  public readonly role: RoleEntity;

  constructor(role: RoleEntity) {
    super();
    this.role = role;
  }
}
