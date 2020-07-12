import { Column, OneToMany, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ContributionVisibilityValue } from 'project/domain/project/value-objects/ContributionVisibility';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { ReviewTopicTypeOrmEntity } from 'project/infrastructure/ReviewTopicTypeOrmEntity';
import { ContributionTypeOrmEntity } from 'project/infrastructure/ContributionTypeOrmEntity';
import { Project } from 'project/domain/project/Project';

@Entity('projects')
@TypeOrmEntity.register(Project)
export class ProjectTypeOrmEntity extends TypeOrmEntity {
  @Column({ name: 'title' })
  public title: string;

  @Column({ name: 'description' })
  public description: string;

  @Column({ name: 'meta', type: 'jsonb' })
  public meta: Record<string, unknown>;

  @Column({ name: 'creator_id' })
  public creatorId: string;

  @Column({ name: 'state', type: 'enum', enum: ProjectStateValue })
  public state: ProjectStateValue;

  @Column({
    name: 'contribution_visibility',
    type: 'enum',
    enum: ContributionVisibilityValue,
  })
  public contributionVisibility: ContributionVisibilityValue;

  @Column({ name: 'skip_manager_review' })
  public skipManagerReview: string;

  @OneToMany(() => RoleTypeOrmEntity, (role) => role.project, {
    eager: true,
    cascade: true,
  })
  public roles: ReadonlyArray<RoleTypeOrmEntity>;

  @OneToMany(
    () => PeerReviewTypeOrmEntity,
    (peerReview) => peerReview.project,
    {
      eager: true,
      cascade: true,
    },
  )
  public peerReviews: ReadonlyArray<PeerReviewTypeOrmEntity>;

  @OneToMany(
    () => ReviewTopicTypeOrmEntity,
    (reviewTopic) => reviewTopic.project,
    {
      eager: true,
      cascade: true,
    },
  )
  public reviewTopics: ReadonlyArray<ReviewTopicTypeOrmEntity>;

  @OneToMany(
    () => ContributionTypeOrmEntity,
    (contribution) => contribution.project,
    {
      eager: true,
      cascade: true,
    },
  )
  public contributions: ReadonlyArray<ContributionTypeOrmEntity>;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    title: string,
    description: string,
    meta: Record<string, unknown>,
    creatorId: string,
    state: ProjectStateValue,
    contributionVisibility: ContributionVisibilityValue,
    skipManagerReview: string,
    roles: ReadonlyArray<RoleTypeOrmEntity>,
    peerReviews: ReadonlyArray<PeerReviewTypeOrmEntity>,
    reviewTopics: ReadonlyArray<ReviewTopicTypeOrmEntity>,
    contributions: ReadonlyArray<ContributionTypeOrmEntity>,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.meta = meta;
    this.creatorId = creatorId;
    this.state = state;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
    this.roles = roles;
    this.peerReviews = peerReviews;
    this.reviewTopics = reviewTopics;
    this.contributions = contributions;
  }
}
