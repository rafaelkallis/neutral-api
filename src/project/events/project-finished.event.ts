import { ProjectEntity } from 'project/entities/project.entity';
import { AbstractEvent } from 'event';
import { RoleEntity } from 'role';

export class ProjectFinishedEvent extends AbstractEvent {
  public readonly project: ProjectEntity;
  public readonly roles: RoleEntity[];

  public constructor(project: ProjectEntity, roles: RoleEntity[]) {
    super();
    this.project = project;
    this.roles = roles;
  }
}
