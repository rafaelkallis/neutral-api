import { ReadonlyProject } from 'project/domain/project/Project';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.archived')
export class ProjectArchivedEvent extends DomainEvent {
  public readonly project: ReadonlyProject;

  public constructor(project: ReadonlyProject) {
    super();
    this.project = project;
  }
}
