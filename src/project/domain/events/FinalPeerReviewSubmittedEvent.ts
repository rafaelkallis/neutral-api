import { RoleModel } from 'role';
import { ProjectModel } from 'project/domain/ProjectModel';
import { AbstractEvent } from 'event';

export class FinalPeerReviewSubmittedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly roles: RoleModel[];

  constructor(project: ProjectModel, roles: RoleModel[]) {
    super();
    this.project = project;
    this.roles = roles;
  }
}
