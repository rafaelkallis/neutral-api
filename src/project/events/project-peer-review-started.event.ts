import { ProjectEntity } from 'project/entities/project.entity';
import { AbstractEvent } from 'event';
import { RoleEntity } from 'role';

export class ProjectPeerReviewStartedEvent extends AbstractEvent {
  public readonly project: ProjectEntity;
  public readonly roles: RoleEntity[];

  constructor(project: ProjectEntity, roles: RoleEntity[]) {
    super();
    this.project = project;
    this.roles = roles;
  }
}
