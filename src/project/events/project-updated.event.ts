import { ProjectEntity } from 'project/entities/project.entity';
import { AbstractEvent } from 'event';

export class ProjectUpdatedEvent extends AbstractEvent {
  public readonly project: ProjectEntity;

  constructor(project: ProjectEntity) {
    super();
    this.project = project;
  }
}
