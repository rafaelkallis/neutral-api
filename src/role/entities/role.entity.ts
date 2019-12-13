import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'common/entities/base.entity';
import { UserEntity } from 'user';
import { ProjectEntity } from 'project';
import { PeerReviewEntity } from 'role/entities/peer-review.entity';

interface RoleEntityOptions {
  id: string;
  projectId: string;
  assigneeId: string | null;
  title: string;
  description: string;
  contribution: number | null;
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

  public static from(options: RoleEntityOptions): RoleEntity {
    return Object.assign(new RoleEntity(), options);
  }

  public update(options: Partial<RoleEntityOptions>): this {
    return Object.assign(this, options);
  }

  public async getProject(): Promise<ProjectEntity> {
    return ProjectEntity.findOneOrFail(this.projectId);
  }

  public async getSentPeerReviews(): Promise<PeerReviewEntity[]> {
    return PeerReviewEntity.find({ reviewerRoleId: this.id });
  }

  public async hasSentPeerReviews(): Promise<boolean> {
    const count = await PeerReviewEntity.count({ reviewerRoleId: this.id });
    return count > 0;
  }

  public async getReceivedPeerReviews(): Promise<PeerReviewEntity[]> {
    return PeerReviewEntity.find({ revieweeRoleId: this.id });
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
