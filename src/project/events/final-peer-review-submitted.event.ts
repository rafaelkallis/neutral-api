import { RoleEntity } from 'role';
import { ProjectEntity } from 'project/entities/project.entity';
import { AbstractEvent } from 'event';

export class FinalPeerReviewSubmittedEvent extends AbstractEvent {
  public readonly project: ProjectEntity;
  public readonly roles: RoleEntity[];

  constructor(project: ProjectEntity, roles: RoleEntity[]) {
    super();
    this.project = project;
    this.roles = roles;
  }
}
