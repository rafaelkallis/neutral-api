import { ProjectEntity } from 'project/entities/project.entity';
import { AbstractEvent } from 'event';

export class ProjectDeletedEvent extends AbstractEvent {
  public readonly project: ProjectEntity;

  public constructor(project: ProjectEntity) {
    super();
    this.project = project;
  }
}
