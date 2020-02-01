import { ProjectModel } from 'project/project.model';
import { AbstractEvent } from 'event';

export class ProjectDeletedEvent extends AbstractEvent {
  public readonly project: ProjectModel;

  public constructor(project: ProjectModel) {
    super();
    this.project = project;
  }
}
