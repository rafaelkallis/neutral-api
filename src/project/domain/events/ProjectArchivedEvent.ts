import { Project } from 'project/domain/Project';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.archived')
export class ProjectArchivedEvent extends DomainEvent {
  public readonly project: Project;

  public constructor(project: Project) {
    super();
    this.project = project;
  }
}
