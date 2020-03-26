import { Project } from 'project/domain/Project';
import { DomainEvent } from 'shared/event/domain/DomainEvent';

export class ProjectUpdatedEvent extends DomainEvent {
  public readonly project: Project;

  constructor(project: Project) {
    super();
    this.project = project;
  }
}
