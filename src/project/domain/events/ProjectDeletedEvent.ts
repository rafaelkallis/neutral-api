import { Project } from 'project/domain/Project';
import { AbstractEvent } from 'event/abstract.event';

export class ProjectDeletedEvent extends AbstractEvent {
  public readonly project: Project;

  public constructor(project: Project) {
    super();
    this.project = project;
  }
}
