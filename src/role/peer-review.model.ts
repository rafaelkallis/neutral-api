import { IsNumber, IsString, MaxLength } from 'class-validator';

import { RoleModel } from 'role/domain/RoleModel';
import { AbstractModel } from 'common';
import { PeerReview } from 'role/role';

/**
 * Peer Review Model
 */
export class PeerReviewModel extends AbstractModel implements PeerReview {
  @IsString()
  @MaxLength(24)
  public senderRoleId: string;

  @IsString()
  @MaxLength(24)
  public receiverRoleId: string;

  @IsNumber()
  public score: number;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    senderRoleId: string,
    receiverRoleId: string,
    score: number,
  ) {
    super(id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.score = score;
  }

  public isSenderRole(role: RoleModel): boolean {
    return this.senderRoleId === role.id;
  }

  public isReceiverRole(role: RoleModel): boolean {
    return this.receiverRoleId === role.id;
  }
}
