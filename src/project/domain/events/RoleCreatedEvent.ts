import { RoleModel } from 'role/domain/RoleModel';
import { AbstractEvent } from 'event/abstract.event';
import { ProjectModel } from 'project/domain/ProjectModel';

export class RoleCreatedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly role: RoleModel;

  public constructor(project: ProjectModel, role: RoleModel) {
    super();
    this.project = project;
    this.role = role;
  }
}
