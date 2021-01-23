import { Column, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { MilestoneTypeOrmEntity } from './MilestoneTypeOrmEntity';
import { ReviewTopicTypeOrmEntity } from './ReviewTopicTypeOrmEntity';
import { MilestoneMetric } from 'project/domain/milestone-metric/MilestoneMetric';

@Entity('milestone_metrics')
@TypeOrmEntity.register(MilestoneMetric)
export class MilestoneMetricTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.milestoneMetrics)
  @JoinColumn({ name: 'project_id' })
  public project!: ProjectTypeOrmEntity;

  @Column({ name: 'project_id' })
  public projectId: string;

  @ManyToOne(() => MilestoneTypeOrmEntity)
  @JoinColumn({ name: 'milestone_id' })
  public milestone!: MilestoneTypeOrmEntity;

  @Column({ name: 'milestone_id' })
  public milestoneId: string;

  @ManyToOne(() => ReviewTopicTypeOrmEntity)
  @JoinColumn({ name: 'review_topic_id' })
  public reviewTopic!: ReviewTopicTypeOrmEntity;

  @Column({ name: 'review_topic_id' })
  public reviewTopicId: string;

  @Column({ name: 'contribution_symmetry' })
  public contributionSymmetry: number;

  @Column({ name: 'consensuality' })
  public consensuality: number;

  @Column({ name: 'agreement' })
  public agreement: number;

  public constructor(
    id: string,
    createdAt: number,
    updatedAt: number,
    projectId: string,
    milestoneId: string,
    reviewTopidId: string,
    contributionSymmetry: number,
    consensuality: number,
    agreement: number,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.milestoneId = milestoneId;
    this.reviewTopicId = reviewTopidId;
    this.contributionSymmetry = contributionSymmetry;
    this.consensuality = consensuality;
    this.agreement = agreement;
  }
}
