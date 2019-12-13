import { IsNumber, IsString, MaxLength } from 'class-validator';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { RoleEntity } from './role.entity';

interface PeerReviewEntityOptions {
  id: string;
  reviewerRoleId: string;
  revieweeRoleId: string;
  score: number;
}

/**
 * Peer Review Entity
 */
@Entity('peer_reviews')
export class PeerReviewEntity extends BaseEntity
  implements PeerReviewEntityOptions {
  @Column({ name: 'reviewer_role_id' })
  public reviewerRoleId!: string;

  @Column({ name: 'reviewee_role_id' })
  @IsString()
  @MaxLength(24)
  public revieweeRoleId!: string;

  @Column({ name: 'score' })
  @IsNumber()
  public score!: number;

  public static from(options: PeerReviewEntityOptions): PeerReviewEntity {
    return Object.assign(new PeerReviewEntity(), options);
  }

  public update(options: Partial<PeerReviewEntityOptions>): this {
    return Object.assign(this, options);
  }

  public isReviewerRole(role: RoleEntity): boolean {
    return this.reviewerRoleId === role.id;
  }

  public isRevieweeRole(role: RoleEntity): boolean {
    return this.revieweeRoleId === role.id;
  }
}
