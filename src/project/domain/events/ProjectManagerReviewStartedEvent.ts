import { Project } from 'project/domain/Project';
import { AbstractEvent } from 'event';

export class ProjectManagerReviewStartedEvent extends AbstractEvent {
  public readonly project: Project;

  constructor(project: Project) {
    super();
    this.project = project;
  }
}
