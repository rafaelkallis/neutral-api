import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { IsPeerReviews } from '../validation/is-peer-reviews';

import { BaseEntity } from './base.entity';

export interface PeerReviews {
  [roleId: string]: number;
}

interface RoleEntityOptions {
  id: string;
  projectId: string;
  assigneeId: string | null;
  title: string;
  description: string;
  peerReviews: PeerReviews | null;
}

/**
 * Role Entity
 */
@Entity('roles')
export class RoleEntity extends BaseEntity implements RoleEntityOptions {
  @Column({ name: 'project_id' })
  @IsString()
  @MaxLength(20)
  public projectId!: string;

  @Column({ name: 'assignee_id', type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  public assigneeId!: string | null;

  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  public title!: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  public description!: string;

  @Column({ name: 'peer_reviews', type: 'jsonb', nullable: true })
  @IsOptional()
  @IsPeerReviews()
  public peerReviews!: PeerReviews | null;

  public static from(options: RoleEntityOptions): RoleEntity {
    return Object.assign(new RoleEntity(), options);
  }

  public update(options: Partial<RoleEntityOptions>): this {
    return Object.assign(this, options);
  }
}
