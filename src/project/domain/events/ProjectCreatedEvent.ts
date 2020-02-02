import { ProjectModel } from 'project/domain/ProjectModel';
import { UserModel } from 'user';
import { AbstractEvent } from 'event';

export class ProjectCreatedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly owner: UserModel;

  public constructor(project: ProjectModel, owner: UserModel) {
    super();
    this.project = project;
    this.owner = owner;
  }
}
