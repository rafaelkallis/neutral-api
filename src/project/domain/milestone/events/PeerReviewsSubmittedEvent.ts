import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ReadonlyMilestone } from '../Milestone';

@DomainEventKey('project.peer_reviews_submitted')
export class PeerReviewsSubmittedEvent extends DomainEvent {
  public readonly milestone: ReadonlyMilestone;
  public readonly submittedPeerReviews: ReadonlyPeerReviewCollection;

  constructor(
    milestone: ReadonlyMilestone,
    submittedPeerReviews: ReadonlyPeerReviewCollection,
  ) {
    super();
    this.milestone = milestone;
    this.submittedPeerReviews = submittedPeerReviews;
  }
}
