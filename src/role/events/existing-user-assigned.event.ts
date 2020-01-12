import { Event } from 'event';
import { RoleEntity } from 'role/entities/role.entity';
import { ProjectEntity } from 'project';
import { UserEntity } from 'user';

export class ExistingUserAssignedEvent extends Event {
  public readonly project: ProjectEntity;
  public readonly role: RoleEntity;
  public readonly assignee: UserEntity;

  constructor(project: ProjectEntity, role: RoleEntity, assignee: UserEntity) {
    super();
    this.project = project;
    this.role = role;
    this.assignee = assignee;
  }
}
