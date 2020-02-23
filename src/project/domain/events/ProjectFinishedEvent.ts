import { Project } from 'project/domain/Project';
import { AbstractEvent } from 'event/abstract.event';

export class ProjectFinishedEvent extends AbstractEvent {
  public readonly project: Project;

  public constructor(project: Project) {
    super();
    this.project = project;
  }
}
