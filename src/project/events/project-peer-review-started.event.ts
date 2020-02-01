import { ProjectModel } from 'project/project.model';
import { AbstractEvent } from 'event';
import { RoleModel } from 'role';

export class ProjectPeerReviewStartedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly roles: RoleModel[];

  constructor(project: ProjectModel, roles: RoleModel[]) {
    super();
    this.project = project;
    this.roles = roles;
  }
}
