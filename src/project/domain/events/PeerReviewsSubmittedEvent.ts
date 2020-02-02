import { RoleModel, PeerReviewModel } from 'role';
import { ProjectModel } from 'project/domain/ProjectModel';
import { AbstractEvent } from 'event';

export class PeerReviewsSubmittedEvent extends AbstractEvent {
  public readonly project: ProjectModel;
  public readonly senderRole: RoleModel;
  public readonly peerReviews: PeerReviewModel[];

  constructor(
    project: ProjectModel,
    senderRole: RoleModel,
    peerReviews: PeerReviewModel[],
  ) {
    super();
    this.project = project;
    this.senderRole = senderRole;
    this.peerReviews = peerReviews;
  }
}
