import { Column, Entity } from 'typeorm';
import { TypeOrmEntity } from 'common';

/**
 * Peer Review TypeOrm Entity
 */
@Entity('peer_reviews')
export class PeerReviewTypeOrmEntity extends TypeOrmEntity {
  @Column({ name: 'sender_role_id' })
  public senderRoleId: string;

  @Column({ name: 'receiver_role_id' })
  public receiverRoleId: string;

  @Column({ name: 'score' })
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
}
