import { Project } from 'project/domain/Project';
import { DomainEvent } from 'event/domain/DomainEvent';

export class ProjectDeletedEvent extends DomainEvent {
  public readonly project: Project;

  public constructor(project: Project) {
    super();
    this.project = project;
  }
}
