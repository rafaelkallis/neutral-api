import { RoleEntity, PeerReviewEntity } from 'role';
import { ProjectEntity } from 'project/entities/project.entity';
import { Event } from 'event';

export class PeerReviewsSubmittedEvent extends Event {
  public readonly project: ProjectEntity;
  public readonly senderRole: RoleEntity;
  public readonly peerReviews: PeerReviewEntity[];

  constructor(
    project: ProjectEntity,
    senderRole: RoleEntity,
    peerReviews: PeerReviewEntity[],
  ) {
    super();
    this.project = project;
    this.senderRole = senderRole;
    this.peerReviews = peerReviews;
  }
}
