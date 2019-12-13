import { IsNumber, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'common/entities/base.entity';
import { RoleEntity } from 'role/entities/role.entity';

interface PeerReviewEntityOptions {
  id: string;
  senderRoleId: string;
  receiverRoleId: string;
  score: number;
}

/**
 * Peer Review Entity
 */
@Entity('peer_reviews')
export class PeerReviewEntity extends BaseEntity
  implements PeerReviewEntityOptions {
  @Column({ name: 'sender_role_id' })
  public senderRoleId!: string;

  @Column({ name: 'receiver_role_id' })
  @IsString()
  @MaxLength(24)
  public receiverRoleId!: string;

  @Column({ name: 'score' })
  @IsNumber()
  public score!: number;

  public static from(options: PeerReviewEntityOptions): PeerReviewEntity {
    return Object.assign(new PeerReviewEntity(), options);
  }

  public update(options: Partial<PeerReviewEntityOptions>): this {
    return Object.assign(this, options);
  }

  public isSenderRole(role: RoleEntity): boolean {
    return this.senderRoleId === role.id;
  }

  public isReceiverRole(role: RoleEntity): boolean {
    return this.receiverRoleId === role.id;
  }
}
