import { IsNumber, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { RoleEntity } from 'role/entities/role.entity';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { TypeOrmPeerReviewRepository } from 'role/repositories/typeorm-peer-review.repository';
import { TypeOrmEntity } from 'common';
import { PeerReview } from 'role/role';

/**
 * Peer Review Entity
 */
@Entity('peer_reviews')
export class TypeOrmPeerReviewEntity extends TypeOrmEntity<PeerReview>
  implements PeerReviewEntity {
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
    typeOrmPeerReviewRepository: TypeOrmPeerReviewRepository,
    id: string,
    createdAt: number,
    updatedAt: number,
    senderRoleId: string,
    receiverRoleId: string,
    score: number,
  ) {
    super(typeOrmPeerReviewRepository, id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.score = score;
  }

  public isSenderRole(role: RoleEntity): boolean {
    return this.senderRoleId === role.id;
  }

  public isReceiverRole(role: RoleEntity): boolean {
    return this.receiverRoleId === role.id;
  }
}
