import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyMilestone } from '../Milestone';

@DomainEventKey('project.manager_review_skipped')
export class ManagerReviewSkippedEvent extends DomainEvent {
  public readonly milestone: ReadonlyMilestone;

  constructor(milestone: ReadonlyMilestone) {
    super();
    this.milestone = milestone;
  }
}
