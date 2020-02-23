import { Role } from 'project/domain/Role';
import { Project } from 'project/domain/Project';
import { AbstractEvent } from 'event';
import { PeerReview } from 'project/domain/PeerReview';

export class PeerReviewsSubmittedEvent extends AbstractEvent {
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
