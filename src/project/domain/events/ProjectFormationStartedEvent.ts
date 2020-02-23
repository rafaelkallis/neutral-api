import { Project } from 'project/domain/Project';
import { AbstractEvent } from 'event/abstract.event';

export class ProjectFormationStartedEvent extends AbstractEvent {
  public readonly project: Project;

  constructor(project: Project) {
    super();
    this.project = project;
  }
}
