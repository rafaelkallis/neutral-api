import { IsNumber, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { RoleEntity } from 'role/entities/role.entity';
import { AbstractEntity } from 'common';
import { PeerReview } from 'role/role';

/**
 * Peer Review Entity
 */
@Entity('peer_reviews')
export class PeerReviewEntity extends AbstractEntity implements PeerReview {
  @Column({ name: 'sender_role_id' })
  public senderRoleId: string;

  @Column({ name: 'receiver_role_id' })
  @IsString()
  @MaxLength(24)
  public receiverRoleId: string;

  @Column({ name: 'score' })
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

  /**
   *
   */
  public static fromPeerReview(peerReview: PeerReview): PeerReviewEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new PeerReviewEntity(
      peerReview.id,
      createdAt,
      updatedAt,
      peerReview.senderRoleId,
      peerReview.receiverRoleId,
      peerReview.score,
    );
  }

  public isSenderRole(role: RoleEntity): boolean {
    return this.senderRoleId === role.id;
  }

  public isReceiverRole(role: RoleEntity): boolean {
    return this.receiverRoleId === role.id;
  }
}
