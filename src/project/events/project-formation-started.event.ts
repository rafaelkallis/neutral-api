import { ProjectEntity } from 'project/entities/project.entity';
import { AbstractEvent } from 'event';

export class ProjectFormationStartedEvent extends AbstractEvent {
  public readonly project: ProjectEntity;

  constructor(project: ProjectEntity) {
    super();
    this.project = project;
  }
}
