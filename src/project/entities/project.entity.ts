import {
  IsString,
  IsNumber,
  IsEnum,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'common';
import { UserEntity } from 'user';
import { RoleEntity } from 'role';

export enum ProjectState {
  FORMATION = 'formation',
  PEER_REVIEW = 'peer-review',
  MANAGER_REVIEW = 'manager-review',
  FINISHED = 'finished',
}

export enum ContributionVisibility {
  PUBLIC = 'public',
  PROJECT = 'project',
  SELF = 'self',
  NONE = 'none',
}

export enum SkipManagerReview {
  YES = 'yes',
  IF_CONSENSUAL = 'if-consensual',
  NO = 'no',
}

export enum PeerReviewVisibility {
  SENT = 'sent',
  SENT_RECEIVEDSCORES = 'sent-receivedscores',
  SENT_RECEIVED = 'sent-received',
}

interface ProjectEntityOptions {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  state: ProjectState;
  consensuality: number | null;
  contributionVisibility: ContributionVisibility;
  peerReviewVisibility: PeerReviewVisibility;
  skipManagerReview: SkipManagerReview;
}

/**
 * Project Entity
 */
@Entity('projects')
export class ProjectEntity extends BaseEntity implements ProjectEntityOptions {
  @Column({ name: 'title' })
  @IsString()
  @MaxLength(100)
  public title!: string;

  @Column({ name: 'description' })
  @IsString()
  @MaxLength(1024)
  public description!: string;

  @Column({ name: 'owner_id' })
  @IsString()
  @MaxLength(24)
  public ownerId!: string;

  @Column({ name: 'state' })
  @IsEnum(ProjectState)
  @MaxLength(255)
  public state!: ProjectState;

  @Column({ name: 'consensuality', type: 'real', nullable: true })
  @IsNumber()
  @IsOptional()
  public consensuality!: number | null;

  @Column({ name: 'contribution_visibility' })
  @IsEnum(ContributionVisibility)
  @MaxLength(255)
  public contributionVisibility!: ContributionVisibility;

  @Column({ name: 'peer_review_visibility' })
  @IsEnum(PeerReviewVisibility)
  @MaxLength(255)
  public peerReviewVisibility!: PeerReviewVisibility;

  @Column({ name: 'skip_manager_review' })
  @IsEnum(SkipManagerReview)
  @MaxLength(255)
  public skipManagerReview!: SkipManagerReview;

  public static from(options: ProjectEntityOptions): ProjectEntity {
    return Object.assign(new ProjectEntity(), options);
  }

  public update(options: Partial<ProjectEntityOptions>): this {
    return Object.assign(this, options);
  }

  public async getRoles(): Promise<RoleEntity[]> {
    return RoleEntity.find({ projectId: this.id });
  }

  public async getOwner(): Promise<UserEntity> {
    return UserEntity.findOneOrFail({ id: this.ownerId });
  }

  public isOwner(user: UserEntity): boolean {
    return this.ownerId === user.id;
  }

  public isFormationState(): boolean {
    return this.state === ProjectState.FORMATION;
  }

  public isPeerReviewState(): boolean {
    return this.state === ProjectState.PEER_REVIEW;
  }

  public isManagerReviewState(): boolean {
    return this.state === ProjectState.MANAGER_REVIEW;
  }

  public isFinishedState(): boolean {
    return this.state === ProjectState.FINISHED;
  }
}
