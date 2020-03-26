import { Role } from 'project/domain/Role';
import { Project } from 'project/domain/Project';
import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { PeerReview } from 'project/domain/PeerReview';

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
