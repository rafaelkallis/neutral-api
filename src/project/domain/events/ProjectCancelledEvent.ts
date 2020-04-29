import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { Project } from 'project/domain/project/Project';

@DomainEventKey('project.cancelled')
export class ProjectCancelledEvent extends DomainEvent {
  public readonly project: Project;

  public constructor(project: Project) {
    super();
    this.project = project;
  }
}
