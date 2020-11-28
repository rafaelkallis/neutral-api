import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyMilestone } from '../Milestone';

@DomainEventKey('project.peer_review_started')
export class PeerReviewStartedEvent extends DomainEvent {
  public readonly milestone: ReadonlyMilestone;

  constructor(milestone: ReadonlyMilestone) {
    super();
    this.milestone = milestone;
  }
}
