import { RoleEntity, PeerReviewEntity } from 'role';
import { ProjectEntity } from 'project/entities/project.entity';
import { AbstractEvent } from 'event';

export class PeerReviewsSubmittedEvent extends AbstractEvent {
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
