import { Event } from 'event';
import { RoleEntity } from 'role/entities/role.entity';
import { ProjectEntity } from 'project';

export class RoleCreatedEvent extends Event {
  public readonly project: ProjectEntity;
  public readonly role: RoleEntity;

  constructor(project: ProjectEntity, role: RoleEntity) {
    super();
    this.project = project;
    this.role = role;
  }
}
