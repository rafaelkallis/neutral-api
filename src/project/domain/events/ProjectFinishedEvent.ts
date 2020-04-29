import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { Project } from 'project/domain/project/Project';

@DomainEventKey('project.finished')
export class ProjectFinishedEvent extends DomainEvent {
  public readonly project: Project;

  public constructor(project: Project) {
    super();
    this.project = project;
  }
}
