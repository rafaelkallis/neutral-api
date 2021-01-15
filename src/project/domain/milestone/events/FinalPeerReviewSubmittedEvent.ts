import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyMilestone } from '../Milestone';

@DomainEventKey('project.final_peer_review_submitted')
export class FinalPeerReviewSubmittedEvent extends DomainEvent {
  public readonly milestone: ReadonlyMilestone;

  constructor(milestone: ReadonlyMilestone) {
    super();
    this.milestone = milestone;
  }
}
