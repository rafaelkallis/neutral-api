import { Project } from 'project/domain/project/Project';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.formation_started')
export class ProjectFormationStartedEvent extends DomainEvent {
  public readonly project: Project;

  constructor(project: Project) {
    super();
    this.project = project;
  }
}
