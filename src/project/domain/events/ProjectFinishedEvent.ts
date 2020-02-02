import { ProjectModel } from 'project/domain/ProjectModel';
import { AbstractEvent } from 'event';
import { RoleModel } from 'role';

export class ProjectFinishedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly roles: RoleModel[];

  public constructor(project: ProjectModel, roles: RoleModel[]) {
    super();
    this.project = project;
    this.roles = roles;
  }
}
