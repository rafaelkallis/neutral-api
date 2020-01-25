import { AbstractEvent } from 'event';
import { RoleEntity } from 'role/entities/role.entity';

export class RoleUpdatedEvent extends AbstractEvent {
  public readonly role: RoleEntity;

  constructor(role: RoleEntity) {
    super();
    this.role = role;
  }
}