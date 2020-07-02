import { Project } from 'project/domain/project/Project';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { ReadonlyPeerReviewCollection } from '../peer-review/PeerReviewCollection';

@DomainEventKey('project.peer_reviews_submitted')
export class PeerReviewsSubmittedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly submittedPeerReviews: ReadonlyPeerReviewCollection;

  constructor(
    project: Project,
    submittedPeerReviews: ReadonlyPeerReviewCollection,
  ) {
    super();
    this.project = project;
    this.submittedPeerReviews = submittedPeerReviews;
  }
}
