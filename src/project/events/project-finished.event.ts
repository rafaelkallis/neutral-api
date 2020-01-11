import { ProjectEntity } from 'project/entities/project.entity';
import { Event } from 'event';

export class ProjectFinishedEvent extends Event {
  public readonly project: ProjectEntity;

  public constructor(project: ProjectEntity) {
    super();
    this.project = project;
  }
}
