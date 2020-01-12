import { Event } from 'event';
import { RoleEntity } from 'role/entities/role.entity';
import { ProjectEntity } from 'project';

export class NewUserAssignedEvent extends Event {
  public readonly project: ProjectEntity;
  public readonly role: RoleEntity;
  public readonly assigneeEmail: string;

  constructor(project: ProjectEntity, role: RoleEntity, assigneeEmail: string) {
    super();
    this.project = project;
    this.role = role;
    this.assigneeEmail = assigneeEmail;
  }
}
