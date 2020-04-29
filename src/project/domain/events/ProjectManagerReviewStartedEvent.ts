import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { Project } from 'project/domain/project/Project';

@DomainEventKey('project.manager_review_started')
export class ProjectManagerReviewStartedEvent extends DomainEvent {
  public readonly project: Project;

  constructor(project: Project) {
    super();
    this.project = project;
  }
}
