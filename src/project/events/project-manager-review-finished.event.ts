import { ProjectModel } from 'project/project.model';
import { AbstractEvent } from 'event';

export class ProjectManagerReviewFinishedEvent extends AbstractEvent {
  public readonly project: ProjectModel;

  constructor(project: ProjectModel) {
    super();
    this.project = project;
  }
}
