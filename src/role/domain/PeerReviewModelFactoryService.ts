import { ModelFactoryService } from 'common/domain/ModelFactoryService';
import { PeerReviewModel } from 'role/domain/PeerReviewModel';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';

export interface CreatePeerReviewOptions {
  senderRoleId: Id;
  receiverRoleId: Id;
  score: number;
}

export class PeerReviewModelFactoryService extends ModelFactoryService {
  /**
   *
   */
  public createPeerReview(
    peerReviewOptions: CreatePeerReviewOptions,
  ): PeerReviewModel {
    const peerReviewId = Id.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const { senderRoleId, receiverRoleId, score } = peerReviewOptions;
    return new PeerReviewModel(
      peerReviewId,
      createdAt,
      updatedAt,
      senderRoleId,
      receiverRoleId,
      score,
    );
  }
}
