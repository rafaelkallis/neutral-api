import { Project } from 'project/domain/Project';
import { AbstractEvent } from 'event';

export class ProjectPeerReviewStartedEvent extends AbstractEvent {
  public readonly project: Project;

  constructor(project: Project) {
    super();
    this.project = project;
  }
}
