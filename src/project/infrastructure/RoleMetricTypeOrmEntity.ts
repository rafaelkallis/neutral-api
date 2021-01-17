import { Column, ManyToOne, JoinColumn, Entity } from 'typeorm';
import { TypeOrmEntity } from 'shared/infrastructure/TypeOrmEntity';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { RoleMetric } from 'project/domain/role-metric/RoleMetric';
import { MilestoneTypeOrmEntity } from './MilestoneTypeOrmEntity';
import { ReviewTopicTypeOrmEntity } from './ReviewTopicTypeOrmEntity';
import { RoleTypeOrmEntity } from './RoleTypeOrmEntity';

@Entity('role_metrics')
@TypeOrmEntity.register(RoleMetric)
export class RoleMetricTypeOrmEntity extends TypeOrmEntity {
  @ManyToOne(() => ProjectTypeOrmEntity, (project) => project.roleMetrics)
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

  @ManyToOne(() => RoleTypeOrmEntity)
  @JoinColumn({ name: 'role_id' })
  public role!: RoleTypeOrmEntity;

  @Column({ name: 'role_id' })
  public roleId: string;

  @Column({ name: 'contribution' })
  public contribution: number;

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
    roleId: string,
    contribution: number,
    consensuality: number,
    agreement: number,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.milestoneId = milestoneId;
    this.reviewTopicId = reviewTopidId;
    this.roleId = roleId;
    this.contribution = contribution;
    this.consensuality = consensuality;
    this.agreement = agreement;
  }
}
