import { ProjectEntity } from 'project/entities/project.entity';
import { RoleEntity } from 'role';
import { Event } from 'event';

export class ProjectPeerReviewFinishedEvent extends Event {
  public readonly project: ProjectEntity;
  public readonly roles: RoleEntity[];

  constructor(project: ProjectEntity, roles: RoleEntity[]) {
    super();
    this.project = project;
    this.roles = roles;
  }
}
