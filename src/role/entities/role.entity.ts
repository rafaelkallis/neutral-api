import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'common/entities/base.entity';
import { UserEntity } from 'user';

interface RoleEntityOptions {
  id: string;
  projectId: string;
  assigneeId: string | null;
  title: string;
  description: string;
  contribution: number | null;
  hasSubmittedPeerReviews: boolean;
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

  @Column({ name: 'contribution', type: 'real', nullable: true })
  @IsNumber()
  @IsOptional()
  public contribution!: number | null;

  @Column({ name: 'has_submitted_peer_reviews' })
  @IsBoolean()
  public hasSubmittedPeerReviews!: boolean;

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

  public assign(user: UserEntity): void {
    this.assigneeId = user.id;
  }
}
