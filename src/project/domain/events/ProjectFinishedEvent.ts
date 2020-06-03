import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyProject } from 'project/domain/project/Project';

@DomainEventKey('project.finished')
export class ProjectFinishedEvent extends DomainEvent {
  public readonly project: ReadonlyProject;

  public constructor(project: ReadonlyProject) {
    super();
    this.project = project;
  }
}
