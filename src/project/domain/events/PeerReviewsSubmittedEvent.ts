import { Role } from 'project/domain/role/Role';
import { Project } from 'project/domain/project/Project';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

@DomainEventKey('project.peer_reviews_submitted')
export class PeerReviewsSubmittedEvent extends DomainEvent {
  public readonly project: Project;
  public readonly senderRole: Role;
  public readonly peerReviews: PeerReview[];

  constructor(project: Project, senderRole: Role, peerReviews: PeerReview[]) {
    super();
    this.project = project;
    this.senderRole = senderRole;
    this.peerReviews = peerReviews;
  }
}
