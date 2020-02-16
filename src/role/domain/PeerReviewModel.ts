import { IsNumber } from 'class-validator';
import { Model } from 'common/domain/Model';
import { RoleModel } from 'role/domain/RoleModel';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';

/**
 * Peer Review Model
 */
export class PeerReviewModel extends Model {
  public senderRoleId: Id;
  public receiverRoleId: Id;

  @IsNumber()
  public score: number;

  public constructor(
    id: Id,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    senderRoleId: Id,
    receiverRoleId: Id,
    score: number,
  ) {
    super(id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.score = score;
  }

  public isSenderRole(role: RoleModel): boolean {
    return this.senderRoleId.equals(role.id);
  }

  public isReceiverRole(role: RoleModel): boolean {
    return this.receiverRoleId === role.id;
  }
}
