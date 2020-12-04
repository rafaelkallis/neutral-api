import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyMilestone } from 'project/domain/milestone/Milestone';

@DomainEventKey('project.manager_review_started')
export class ManagerReviewStartedEvent extends DomainEvent {
  public readonly milestone: ReadonlyMilestone;

  constructor(milestone: ReadonlyMilestone) {
    super();
    this.milestone = milestone;
  }
}
