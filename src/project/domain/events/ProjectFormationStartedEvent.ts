import { ProjectModel } from 'project/domain/ProjectModel';
import { AbstractEvent } from 'event';

export class ProjectFormationStartedEvent extends AbstractEvent {
  public readonly project: ProjectModel;

  constructor(project: ProjectModel) {
    super();
    this.project = project;
  }
}
