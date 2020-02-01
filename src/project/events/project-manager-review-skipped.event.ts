import { ProjectModel } from 'project/project.model';
import { AbstractEvent } from 'event';

export class ProjectManagerReviewSkippedEvent extends AbstractEvent {
  public readonly project: ProjectModel;

  constructor(project: ProjectModel) {
    super();
    this.project = project;
  }
}
