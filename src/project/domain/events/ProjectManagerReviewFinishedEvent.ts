import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { Id } from 'shared/domain/value-objects/Id';

@DomainEventKey('project.manager_review_finished')
export class ProjectManagerReviewFinishedEvent extends DomainEvent {
  public readonly projectId: Id;

  constructor(projectId: Id) {
    super();
    this.projectId = projectId;
  }
}
