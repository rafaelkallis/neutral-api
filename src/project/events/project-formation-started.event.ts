import { ProjectEntity } from 'project/entities/project.entity';
import { Event } from 'event';

export class ProjectFormationStartedEvent extends Event {
  public readonly project: ProjectEntity;

  constructor(project: ProjectEntity) {
    super();
    this.project = project;
  }
}
