import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { PeerReviewEntity } from './peer-review.entity';

interface RoleEntityOptions {
  id: string;
  projectId: string;
  assigneeId: string | null;
  title: string;
  description: string;
  peerReviews: PeerReviewEntity[];
}

/**
 * Role Entity
 */
@Entity('roles')
export class RoleEntity extends BaseEntity implements RoleEntityOptions {
  @Column({ name: 'project_id' })
  @IsString()
  @MaxLength(24)
  public projectId!: string;

  @Column({ name: 'assignee_id', type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  public assigneeId!: string | null;

  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  public title!: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  public description!: string;

  @OneToMany(() => PeerReviewEntity, peerReview => peerReview.reviewerRole, {
    eager: true,
    cascade: true,
  })
  public peerReviews!: PeerReviewEntity[];

  public static from(options: RoleEntityOptions): RoleEntity {
    return Object.assign(new RoleEntity(), options);
  }

  public update(options: Partial<RoleEntityOptions>): this {
    return Object.assign(this, options);
  }

  public hasAssignee(): boolean {
    return Boolean(this.assigneeId);
  }

  public isAssignee(user: UserEntity): boolean {
    return this.assigneeId === user.id;
  }

  public hasPeerReviews(): boolean {
    return this.peerReviews.length > 0;
  }
}
