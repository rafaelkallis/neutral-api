import { Column, OneToMany, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectStateValue } from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ContributionVisibilityValue } from 'project/domain/project/value-objects/ContributionVisibility';
import { PeerReviewVisibilityLabel } from 'project/domain/project/value-objects/PeerReviewVisibility';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { ReviewTopicTypeOrmEntity } from 'project/infrastructure/ReviewTopicTypeOrmEntity';
import { Project } from 'project/domain/project/Project';
import { MilestoneTypeOrmEntity } from './MilestoneTypeOrmEntity';
import { RoleMetricTypeOrmEntity } from './RoleMetricTypeOrmEntity';
import { MilestoneMetricTypeOrmEntity } from './MilestoneMetricTypeOrmEntity';

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

  @Column({
    name: 'peer_review_visibility',
    type: 'enum',
    enum: PeerReviewVisibilityLabel,
  })
  public peerReviewVisibility: PeerReviewVisibilityLabel;

  @Column({ name: 'skip_manager_review' })
  public skipManagerReview: string;

  @OneToMany(() => RoleTypeOrmEntity, (role) => role.project, { cascade: true })
  public roles: ReadonlyArray<RoleTypeOrmEntity>;

  @OneToMany(
    () => PeerReviewTypeOrmEntity,
    (peerReview) => peerReview.project,
    { cascade: true },
  )
  public peerReviews: ReadonlyArray<PeerReviewTypeOrmEntity>;

  @OneToMany(
    () => ReviewTopicTypeOrmEntity,
    (reviewTopic) => reviewTopic.project,
    { cascade: true },
  )
  public reviewTopics: ReadonlyArray<ReviewTopicTypeOrmEntity>;

  @OneToMany(() => MilestoneTypeOrmEntity, (milestone) => milestone.project, {
    cascade: true,
  })
  public milestones: ReadonlyArray<MilestoneTypeOrmEntity>;

  @OneToMany(
    () => RoleMetricTypeOrmEntity,
    (roleMetric) => roleMetric.project,
    {
      cascade: true,
    },
  )
  public roleMetrics: ReadonlyArray<RoleMetricTypeOrmEntity>;

  @OneToMany(
    () => MilestoneMetricTypeOrmEntity,
    (milestoneMetric) => milestoneMetric.project,
    {
      cascade: true,
    },
  )
  public milestoneMetrics: ReadonlyArray<MilestoneMetricTypeOrmEntity>;

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
    peerReviewVisibility: PeerReviewVisibilityLabel,
    skipManagerReview: string,
    roles: ReadonlyArray<RoleTypeOrmEntity>,
    peerReviews: ReadonlyArray<PeerReviewTypeOrmEntity>,
    reviewTopics: ReadonlyArray<ReviewTopicTypeOrmEntity>,
    milestones: ReadonlyArray<MilestoneTypeOrmEntity>,
    roleMetrics: ReadonlyArray<RoleMetricTypeOrmEntity>,
    milestoneMetrics: ReadonlyArray<MilestoneMetricTypeOrmEntity>,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.meta = meta;
    this.creatorId = creatorId;
    this.state = state;
    this.contributionVisibility = contributionVisibility;
    this.peerReviewVisibility = peerReviewVisibility;
    this.skipManagerReview = skipManagerReview;
    this.roles = roles;
    this.peerReviews = peerReviews;
    this.reviewTopics = reviewTopics;
    this.milestones = milestones;
    this.roleMetrics = roleMetrics;
    this.milestoneMetrics = milestoneMetrics;
  }
}
