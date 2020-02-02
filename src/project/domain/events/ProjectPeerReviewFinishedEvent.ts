import { ProjectModel } from 'project/domain/ProjectModel';
import { RoleModel } from 'role';
import { AbstractEvent } from 'event';

export class ProjectPeerReviewFinishedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly roles: RoleModel[];

  constructor(project: ProjectModel, roles: RoleModel[]) {
    super();
    this.project = project;
    this.roles = roles;
  }
}
